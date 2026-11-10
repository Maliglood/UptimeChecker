import { redis } from '../lib/redis.js';
import { logger } from '../lib/logger.js';
import type { SiteStatusData } from '../types/status.types.js';

const STATS_KEY_PREFIX = 'status-page-site:';
const STATS_KEY_SUFFIX = ':stats';

function statsKey(siteId: string): string {
  return `${STATS_KEY_PREFIX}${siteId}${STATS_KEY_SUFFIX}`;
}

/**
 * Возвращает агрегированные данные о статусе сайта.
 * @param siteId Идентификатор сайта
 * @returns Статус сайта. Если данных в Redis нет, возвращает значения по умолчанию (100% uptime).
 */
export async function getSiteStatus(siteId: string): Promise<SiteStatusData> {
  const key = statsKey(siteId);

  const [totalRaw, successfulRaw] = await redis.hmget(key, 'total', 'successful');

  const total = totalRaw ? Number(totalRaw) : 0;
  const successful = successfulRaw ? Number(successfulRaw) : 0;

  if (total === 0) {
    logger.warn({ siteId }, 'Нет данных о проверках для сайта, возвращён uptime 100%');
    return {
      siteId,
      siteName: siteId,
      uptimePercent: 100,
      totalChecks: 0,
      successfulChecks: 0,
    };
  }

  const uptimePercent = Math.min(100, Math.max(0, (successful / total) * 100));

  return {
    siteId,
    siteName: siteId,
    uptimePercent: Number(uptimePercent.toFixed(3)),
    totalChecks: total,
    successfulChecks: successful,
  };
}