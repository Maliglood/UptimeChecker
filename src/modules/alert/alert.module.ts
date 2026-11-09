import { Module } from '@nestjs/common';
import { AlertService } from './application/services/alert.service';

@Module({
  providers: [AlertService],
  exports: [AlertService],
})
export class AlertModule {}