import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job, UnrecoverableError } from 'bullmq';
import { Logger } from 'nestjs-pino';
import { AxiosError } from 'axios';
import { MONITOR_QUEUE_NAME } from '@monitor/monitor.constants';
import { MonitorService } from '@monitor/application/services/monitor.service';
import { HttpClientService } from '@monitor/infrastructure/http/http-client.service';
import { AlertService } from '@alert/application/services/alert.service';

/**
 * Обработчик проверок сайтов.
 */
@Processor(MONITOR_QUEUE_NAME)
export class CheckProcessor extends WorkerHost {
  constructor(
    /**
     * Сервис управления мониторами.
     */
    private readonly monitorService: MonitorService,
  
    /**
     * Сервис HTTP-запросов к сайтам.
     */
    private readonly httpClientService: HttpClientService,

    /**
     * Сервис уведомлений.
     */
    private readonly alertService: AlertService,

    /**
     * Логгер.
     */
    private readonly logger: Logger,
  ) {
    super();
  }

  /**
   * Обработка задания.
   * @param job Данные задания.
   * @returns 
   */
  async process(job: Job<{ monitorId: string }>): Promise<any> {
    const { monitorId } = job.data;
    const monitor = await this.monitorService.getById(monitorId);

    if (!monitor.isActive) {
      return { skipped: true };
    }

    try {
      const { status, responseTime } = await this.httpClientService.check(monitor.url);

      monitor.lastCheckedAt = new Date();
      monitor.lastStatusCode = status;
      monitor.lastResponseTime = responseTime;

      await this.monitorService.update(monitor);

      if (status >= 400) {
        await this.alertService.sendDownAlert(monitor, status);
      }

      return { status, responseTime };
    } catch (error) {
      this.logger.error({ err: error, monitorId }, 'Check failed');
      await this.alertService.sendDownAlert(monitor, null, error as Error);

      const axiosError = error as AxiosError;
      const isPermanent = axiosError.code === 'ENOTFOUND' || axiosError.code === 'ERR_INVALID_URL';

      if (isPermanent) {
        throw new UnrecoverableError(axiosError.message);
      }

      throw error;
    }
  }

  /**
   * Обработчик упавшей обработки задания.
   * @param job Обрабатываемое задание.
   * @param error Ошибка.
   */
  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error({ jobId: job.id, err: error }, 'Check job failed');
  }
}