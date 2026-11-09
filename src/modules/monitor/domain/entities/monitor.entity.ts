/**
 * Доменная сущность «Монитор» — отслеживаемый пользователем URL вместе с накопленной статистикой последней проверки.
 */
export class Monitor {
  constructor(
    /**
     * GUID монитора.
     */
    public readonly id: string,
  
    /**
     * Отслеживаемый URL.
     */
    public readonly url: string,
  
    /**
     * Желаемый интервал проверки в секундах.
     */
    public readonly interval: number,
  
    /**
     * Флаг того, что монитор нужно проверять.
     */
    public isActive: boolean = true,
  
    /**
     * Время последней проверки.
     */
    public lastCheckedAt?: Date,
  
    /**
     * HTTP-код ответа последней проверки.
     */
    public lastStatusCode?: number,
  
    /**
     * Время ответа последней проверки в миллисекундах.
     */
    public lastResponseTime?: number,
  
    /**
     * Дата создания.
     */
    public readonly createdAt: Date = new Date(),
  
    /**
     * Дата последнего изменения.
     */
    public updatedAt: Date = new Date(),
  ) {}
}