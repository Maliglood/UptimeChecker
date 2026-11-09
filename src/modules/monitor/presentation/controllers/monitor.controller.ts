import { Controller, Post, Body, Get, Param, Query, NotFoundException, BadRequestException } from '@nestjs/common';
import { MonitorService } from '@monitor/application/services/monitor.service';
import { CreateMonitorDto } from '@monitor/presentation/dto/create-monitor.dto';

/**
 * HTTP-контроллер.
 */
@Controller('monitors')
export class MonitorController {
  constructor(private readonly monitorService: MonitorService) {}

  /**
   * Создание монитора проверки.
   * @param dto Данные о проверке
   * @returns Модель монитора из хранилища
   */
  @Post()
  async create(@Body() dto: CreateMonitorDto) {
    return this.monitorService.create(dto.url, dto.interval);
  }

  /**
   * Создание монитора проверки - ЛЕНИВЫЙ ВАРИАНТ ДЛЯ ТЕСТА ИЗ БРАУЗЕРА.
   * @param url URL проверяемого сайта
   * @param interval Желаемый интервал проверки
   * @returns Модель монитора из хранилища
   */
  @Get('createtest')
  async createTest(
    @Query('url') url: string,
    @Query('interval') intervalStr?: string
  ) {
    if (process.env.NODE_ENV === 'production') {
      throw new NotFoundException();
    }

    if (!url) {
      throw new BadRequestException('url is required');
    }

    const normalizedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const interval = intervalStr ? parseInt(intervalStr, 10) : 60;

    if (Number.isNaN(interval)) {
      throw new BadRequestException('interval must be an integer');
    }

    return this.create({
      url: normalizedUrl,
      interval
    });
  }

  /**
   * Возвращает Модель монитора из хранилища.
   * @param id GUID монитора
   * @returns Модель монитора из хранилища
   */
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.monitorService.getById(id);
  }
}