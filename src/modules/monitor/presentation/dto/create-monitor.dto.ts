import { IsUrl, IsOptional, IsInt, Min } from 'class-validator';

/**
 * ДТО для создания монитора проверки.
 */
export class CreateMonitorDto {
  /**
   * Проверяемый URL.
   */
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  url!: string;

  /**
   * Желаемый интервал.
   */
  @IsOptional()
  @IsInt()
  @Min(30)
  interval?: number;
}