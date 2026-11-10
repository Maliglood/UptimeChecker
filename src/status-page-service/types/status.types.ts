/**
 * Агрегированные метрики доступности сайта.
 */
export interface SiteStatusData {
  /**
   * Уникальный идентификатор сайта.
   */
  siteId: string;

  /**
   * Имя сайта.
   */
  siteName: string;

  /**
   * Процент успешных проверок.
   */
  uptimePercent: number;

  /**
   * Общее количество проверок за всё время наблюдения.
   */
  totalChecks: number;

  /**
   * Количество успешных проверок.
   */
  successfulChecks: number;
}

/**
 * Данные для рендеринга SVG-бейджа в стиле shields.io.
 */
export interface BadgeViewModel {
  /**
   * Текст левой части бейджа.
   */
  label: string;

  /**
   * Значение успешности.
   */
  value: string;

  /**
   * Цвет статуса.
   */
  color: string;

  /**
   * Ширина левой части бейджа в пикселях.
   */
  labelWidth: number;

  /**
   * Ширина правой части бейджа (значения успешности) в пикселях.
   */
  valueWidth: number;

  /**
   * Общая ширина.
   */
  totalWidth: number;
}

/**
 * Данные для рендеринга HTML-страницы статуса.
 */
export interface StatusPageViewModel extends SiteStatusData {
  /**
   * Человекочитаемая метка статуса, отображаемая рядом с индикатором.
   */
  statusLabel: string;

  /**
   * Цвет статуса.
   */
  statusColor: string;

  /**
   * URL-бейджа.
   */
  badgeUrl: string;
}