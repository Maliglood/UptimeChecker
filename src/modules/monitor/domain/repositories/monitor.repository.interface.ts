import { Monitor } from '../entities/monitor.entity';

/**
 * Интерфейс доступа к хранилищу мониторов.
 */
export interface MonitorRepository {
  /**
   * Добавление нового или сохранения существуцющего монитора.
   * @param monitor Данные монитора
   * @returns Сохранённый монитор
   */
  upsert(monitor: Monitor): Promise<Monitor>;

  /**
   * Находит и возвращает монитор по идентификатору.
   * @param id GUID монитора
   * @returns Запрашиваемый монитор
   */
  getById(id: string): Promise<Monitor | null>;

  /**
   * Возвращает все активные мониторы.
   * @returns Массив активных мониторов
   */
  getAllActive(): Promise<Monitor[]>;
}

export const MONITOR_REPOSITORY = Symbol('MONITOR_REPOSITORY');