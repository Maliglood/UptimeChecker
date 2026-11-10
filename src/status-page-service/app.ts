import path from 'node:path';
import express from 'express';
import pinoHttp from 'pino-http';
import { logger } from './lib/logger.js';
import { badgeRouter } from './routes/badge.route.js';
import { statusRouter } from './routes/status.route.js';

export function createApp(): express.Express {
  const app = express();

  // Указываем EJS и точный путь к папке views относительно текущего файла, т.к. легаси
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  app.disable('x-powered-by');

  app.use(
    pinoHttp({
      logger,
      autoLogging: {
        ignore: (req) => req.url === '/health',
      },
    }),
  );

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/badge', badgeRouter);
  app.use('/status', statusRouter);

  // Обработчик 404
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  // Централизованный обработчик ошибок
  app.use(
    (
      err: Error,
      req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      req.log.error({ err }, 'Необработанная ошибка');
      if (res.headersSent) return;
      res.status(500).json({ error: 'Internal Server Error' });
    },
  );

  return app;
}