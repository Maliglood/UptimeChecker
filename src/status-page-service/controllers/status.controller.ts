import type { Request, Response, NextFunction } from 'express';
import ejs from 'ejs';
import path from 'node:path';
import { getSiteStatus } from '../services/status.service.js';
import type { BadgeViewModel, StatusPageViewModel } from '../types/status.types.js';
import { STATUS_COLORS, type StatusLevel } from '../lib/status-colors';

const UPTIME_THRESHOLD_OPERATIONAL = 99;
const UPTIME_THRESHOLD_DEGRADED = 95;

const STATUS_TEMPLATE_PATH = path.join(__dirname, '..', 'views', 'status.ejs'); // HTML-страница
const BADGE_TEMPLATE_PATH = path.join(__dirname, '..', 'views', 'badge.ejs');

type OutputType = 'html' | 'svg';

/**
 * Вычисление уровня по значению успешности.
 * @param uptimePercent Знеачение успешности в процентах
 * @returns Значение уровеня
 */
function convertToStatusLevel(uptimePercent: number): StatusLevel {
  if (uptimePercent >= UPTIME_THRESHOLD_OPERATIONAL)
  {
    return 'operational';
  }

  if (uptimePercent >= UPTIME_THRESHOLD_DEGRADED)
  {
    return 'degraded';
  }

  return 'outage';
}

/**
 * Словарь значений уровней.
 */
const STATUS_LABELS: Record<StatusLevel, string> = {
  operational: 'Operational',
  degraded: 'Degraded',
  outage: 'Outage',
};

/**
 * Извлечение типа ответа.
 * @param raw Параметр.
 * @returns Тип ответа.
 */
function parseOutputType(raw: unknown): OutputType {
  return raw === 'html' ? 'html' : 'svg'; // По умолчанию отправляем картинку
}

/**
 * Генерация модели для изображения статуса.
 * @param label Текст левой части бейджа
 * @param value Значение успешности
 * @param color Цвет стаутса
 * @returns Данные для рендеринга SVG-бейджа
 */
function buildBadgeViewModel(
  label: string,
  value: string,
  color: string,
): BadgeViewModel {
  // Приблизительные ширины для шрифта Verdana 11px, используемого в shields.io
  const labelWidth = Math.max(50, label.length * 7 + 10);
  const valueWidth = Math.max(50, value.length * 7 + 10);

  return {
    label,
    value,
    color,
    labelWidth,
    valueWidth,
    totalWidth: labelWidth + valueWidth,
  };
}

/**
 * Генерация бейджа.
 * @param siteId Идентификатор сайта
 * @returns Изображение бейджа
 */
async function renderSvg(siteId: string): Promise<string> {
  const status = await getSiteStatus(siteId);
  const value = `${status.uptimePercent.toFixed(1)}% uptime`;
  const level = convertToStatusLevel(status.uptimePercent);
  const color = STATUS_COLORS[level];
  const viewModel = buildBadgeViewModel('status', value, color);

  return ejs.renderFile(BADGE_TEMPLATE_PATH, viewModel, { async: true });
}

/**
 * Генерация статуса в HTML.
 * @param siteId Идентификатор сайта
 * @returns HTML-страница
 */
async function renderHtml(siteId: string): Promise<string> {
  const status = await getSiteStatus(siteId);
  const level = convertToStatusLevel(status.uptimePercent);
  const color = STATUS_COLORS[level];
  const label = STATUS_LABELS[level];

  const viewModel: StatusPageViewModel = {
    ...status,
    statusLabel: label,
    statusColor: color,
    badgeUrl: `/status/${encodeURIComponent(siteId)}?type=svg`, // ссылка на тот же роут, но в формате SVG
  };

  return ejs.renderFile(STATUS_TEMPLATE_PATH, viewModel, { async: true });
}

/**
 * HTTP-контроллер статусов.
 * @returns 
 */
export async function statusController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { siteId } = req.params as { siteId: string };
    const type = parseOutputType((req.query as { type?: unknown }).type);

    if (type === 'svg') {
      const svg = await renderSvg(siteId);
      res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.status(200).send(svg);

      return;
    }

    const html = await renderHtml(siteId);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (err) {
    next(err);
  }
}