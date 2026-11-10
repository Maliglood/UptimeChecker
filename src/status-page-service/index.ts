import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { redis } from './lib/redis.js';

const app = createApp();

const server = app.listen(env.port, () => {
  logger.info({ port: env.port }, 'Сервис запущен');
});

async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, 'Получен сигнал завершения, останавливаем сервис');

  server.close(async () => {
    logger.info('HTTP-сервер остановлен');
    try {
      await redis.quit();
      logger.info('Соединение с Redis закрыто');
    } catch (err) {
      logger.error({ err }, 'Ошибка при закрытии Redis');
    }
    process.exit(0);
  });

  // Принудительное завершение, если graceful shutdown затянулся
  setTimeout(() => {
    logger.error('Принудительное завершение по таймауту');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));