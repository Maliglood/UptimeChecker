import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  MonitorRepository,
  MONITOR_REPOSITORY,
} from '@monitor/domain/repositories/monitor.repository.interface';
import { Monitor } from '@monitor/domain/entities/monitor.entity';

/**
 * Сервис управления мониторами.
 */
@Injectable()
export class MonitorService {
  constructor(
    @Inject(MONITOR_REPOSITORY)
    private readonly repository: MonitorRepository,
  ) {}

  /**
   * Создаёт новый монитор.
   * @param url URL для отслеживания
   * @param interval Желаемый интервал проверки в секундах.
   * @returns Сохранённый монитор
   */
  async create(url: string, interval = 60): Promise<Monitor> {
    const monitor = new Monitor(randomUUID(), url, interval);

    return this.repository.upsert(monitor);
  }

  /**
   * Возвращает все активные мониторы.
   * @returns Массив активных мониторов
   */
  async getAllActive(): Promise<Monitor[]> {
    return this.repository.getAllActive();
  }

  /**
   * Находит и возвращает монитор по идентификатору.
   * @param id GUID монитора
   * @returns Запрашиваемый монитор
   */
  async getById(id: string): Promise<Monitor> {
    const monitor = await this.repository.getById(id);

    if (!monitor) {
      throw new NotFoundException(`Monitor with id "${id}" not found`);
    }

    return monitor;
  }

  /**
   * Обновляет существующий монитор.
   * @param monitor Сущность `Monitor` с применёнными изменениями
   * @returns Сохранённая сущность
   */
  async update(monitor: Monitor): Promise<Monitor> {
    monitor.updatedAt = new Date();

    return this.repository.upsert(monitor);
  }
}