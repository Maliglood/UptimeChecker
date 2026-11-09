import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MONITOR_QUEUE_NAME } from '@monitor/monitor.constants';
import { MonitorController } from './presentation/controllers/monitor.controller';
import { MonitorService } from './application/services/monitor.service';
import { InMemoryMonitorRepository } from './infrastructure/persistence/in-memory-monitor.repository';
import { MONITOR_REPOSITORY } from './domain/repositories/monitor.repository.interface';
import { CheckProcessor } from './infrastructure/queue/check.processor';
import { MonitorScheduler } from './presentation/schedulers/monitor.scheduler';
import { HttpClientService } from './infrastructure/http/http-client.service';
import { AlertModule } from '../alert/alert.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: MONITOR_QUEUE_NAME }),
    AlertModule,
  ],
  controllers: [MonitorController],
  providers: [
    MonitorService,
    HttpClientService,
    CheckProcessor,
    MonitorScheduler,
    {
      provide: MONITOR_REPOSITORY,
      useClass: InMemoryMonitorRepository,
    },
  ],
  exports: [MonitorService],
})
export class MonitorModule {}