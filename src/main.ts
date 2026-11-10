import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import pino from 'pino';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { createApp as createLegacyStatusApp } from './status-page-service/app';
import { redis as legacyRedis } from './status-page-service/lib/redis';

const bootstrapLogger = pino();

process.on('unhandledRejection', (reason, promise) => {
  bootstrapLogger.error(
    { reason, promise },
    'Unhandled Rejection — shutting down',
  );
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  bootstrapLogger.error({ err: error }, 'Uncaught Exception — shutting down');
  process.exit(1);
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.useGlobalFilters(new AllExceptionsFilter(app.get(Logger)));
  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Добавляем легаси на Express
  const legacyApp = createLegacyStatusApp();
  app.use('/badge', legacyApp);
  const shutdownSignals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];
  shutdownSignals.forEach((signal) => {
    process.once(signal, async () => {
      await legacyRedis.quit().catch(() => {});
    });
  });


  const port = process.env.PORT || 3000;
  await app.listen(port);
}

bootstrap();