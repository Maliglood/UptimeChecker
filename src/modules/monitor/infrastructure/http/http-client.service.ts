import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { HttpCheckResult } from '@monitor/infrastructure/types'

/**
 * Сервис HTTP-запросов для проверки сайтов.
 */
@Injectable()
export class HttpClientService {
  /**
   * HTTP-клиент.
   */
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      timeout: 10_000,
      validateStatus: () => true,
    });
  }

  /**
   * 
   * @param url Проверка сайта.
   * @returns 
   */
  async check(url: string): Promise<HttpCheckResult> {
    const start = Date.now();
    const response = await this.client.get(url);
    const responseTime = Date.now() - start;

    return { status: response.status, responseTime };
  }
}