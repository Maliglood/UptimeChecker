import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MONITOR_QUEUE_NAME } from '@monitor/monitor.constants';
import { MonitorService } from '@monitor/application/services/monitor.service';

/**
 * Планировщик фоновых проверок мониторов. 
 */
@Injectable()
export class MonitorScheduler {
  private readonly logger = new Logger(MonitorScheduler.name);

  constructor(
    private readonly monitorService: MonitorService,
    @InjectQueue(MONITOR_QUEUE_NAME) private readonly checkQueue: Queue,
  ) {}

  /**
   * Cron-джоба: Раз в минуту ставит в очередь задания на проверку всех активных мониторов.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async enqueueChecks(): Promise<void> {
    const monitors = await this.monitorService.getAllActive();

    for (const monitor of monitors) {
      await this.checkQueue.add(
        'check',
        { monitorId: monitor.id },
        {
          removeOnComplete: true,
          removeOnFail: false,
          attempts: 3,
          backoff: { type: 'exponential', delay: 5_000 },
        },
      );
    }

    this.logger.debug(`Enqueued ${monitors.length} checks`);
  }
}