import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import pino from 'pino';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

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

  const port = process.env.PORT || 3000;
  await app.listen(port);
}

bootstrap();