import { Redis } from 'ioredis';
import { env } from '../config/env.js';
import { logger } from './logger.js';

export const redis = new Redis({
  host: env.redisHost,
  port: env.redisPort,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 2000);
    logger.warn({ times, delay }, 'Повторное подключение к Redis');
    return delay;
  },
});

redis.on('connect', () => {
  logger.info('Подключение к Redis установлено');
});

redis.on('error', (err) => {
  logger.error({ err }, 'Ошибка Redis');
});