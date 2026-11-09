import { Injectable } from '@nestjs/common';
import { MonitorRepository } from '../../domain/repositories/monitor.repository.interface';
import { Monitor } from '../../domain/entities/monitor.entity';

/**
 * Хранилище мониторов в локальной памяти.
 */
@Injectable()
export class InMemoryMonitorRepository implements MonitorRepository {
  private readonly monitors = new Map<string, Monitor>();

  async upsert(monitor: Monitor): Promise<Monitor> {
    this.monitors.set(monitor.id, monitor);
  
    return monitor;
  }

  async getById(id: string): Promise<Monitor | null> {
    return this.monitors.get(id) ?? null;
  }

  async getAllActive(): Promise<Monitor[]> {
    return Array.from(this.monitors.values()).filter((m) => m.isActive);
  }
}