import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Отсутствует обязательная переменная окружения: ${name}`);
  }

  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  redisHost: required('REDIS_HOST'),
  redisPort: Number(required('REDIS_PORT')),
  logLevel: process.env.LOG_LEVEL ?? 'info',
} as const;