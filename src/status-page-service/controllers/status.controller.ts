import type { Request, Response, NextFunction } from 'express';
import ejs from 'ejs';
import path from 'node:path';
import { getSiteStatus } from '../services/status.service.js';
import type { BadgeViewModel, StatusPageViewModel } from '../types/status.types.js';

// const 

const STATUS_TEMPLATE_PATH = path.join(__dirname, '..', 'views', 'status.ejs'); // HTML-страница
const BADGE_TEMPLATE_PATH = path.join(__dirname, '..', 'views', 'badge.ejs');

type OutputType = 'html' | 'svg';

function parseOutputType(raw: unknown): OutputType {
  return raw === 'html' ? 'html' : 'svg'; // По умолчанию отправляем картинку
}

function uptimeColor(uptimePercent: number): string {
  if (uptimePercent >= 99)
  {
    return '#4c1';
  }

  if (uptimePercent >= 95)
  {
    return '#dfb317';
  }

  return '#e05d44';
}

function statusLabelAndColor(uptimePercent: number): {
  label: string;
  color: string;
} {
  if (uptimePercent >= 99) return { label: 'Operational', color: '#4c1' };
  if (uptimePercent >= 95) return { label: 'Degraded', color: '#dfb317' };
  return { label: 'Outage', color: '#e05d44' };
}

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

async function renderSvg(siteId: string): Promise<string> {
  const status = await getSiteStatus(siteId);
  const value = `${status.uptimePercent.toFixed(1)}% uptime`;
  const color = uptimeColor(status.uptimePercent);
  const viewModel = buildBadgeViewModel('status', value, color);

  return ejs.renderFile(BADGE_TEMPLATE_PATH, viewModel, { async: true });
}

async function renderHtml(siteId: string): Promise<string> {
  const status = await getSiteStatus(siteId);
  const { label, color } = statusLabelAndColor(status.uptimePercent);

  const viewModel: StatusPageViewModel = {
    ...status,
    statusLabel: label,
    statusColor: color,
    // ссылка на тот же роут, но в формате SVG
    badgeUrl: `/status/${encodeURIComponent(siteId)}?type=svg`,
  };

  return ejs.renderFile(STATUS_TEMPLATE_PATH, viewModel, { async: true });
}

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