import { Injectable, Logger } from '@nestjs/common';
import type { Monitor } from '@monitor/domain/entities/monitor.entity';

/**
 * Сервис уведомлений о недоступности отслеживаемых сайтов.
 */
@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);

  /**
   * Уведомляет о недоступности сайта.
   * @param monitor Монитор, по которому зафиксирован сбой
   * @param statusCode HTTP-код ответа. Если ответа не было (сетевая ошибка) - то `null`
   * @param error Исходное исключение axios
   */
  async sendDownAlert(
    monitor: Monitor,
    statusCode: number | null,
    error?: Error,
  ): Promise<void> {
    this.logger.warn(
      {
        monitorId: monitor.id,
        url: monitor.url,
        statusCode,
        error: error?.message,
      },
      `ALERT: Site ${monitor.url} is DOWN`,
    );
  }
}