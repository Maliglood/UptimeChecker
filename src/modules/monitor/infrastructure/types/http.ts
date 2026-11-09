/**
 * Результат проверки сайта.
 */
export interface HttpCheckResult {
  
  /**
   * HTTP-код ответа проверки.
   */
  status: number;

  /**
   * Время ответа проверки в миллисекундах.
   */
  responseTime: number;
}