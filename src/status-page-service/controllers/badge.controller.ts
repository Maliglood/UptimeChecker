import type { Request, Response, NextFunction } from 'express';
import ejs from 'ejs';
import path from 'node:path';
import { getSiteStatus } from '../services/status.service.js';
import type { BadgeViewModel } from '../types/status.types.js';

const BADGE_TEMPLATE_PATH = path.join(__dirname, '..', 'views', 'badge.ejs');

function uptimeColor(uptimePercent: number): string {
  if (uptimePercent >= 99) return '#4c1'; // ярко-зелёный
  if (uptimePercent >= 95) return '#dfb317'; // жёлтый
  return '#e05d44'; // красный
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

export async function badgeController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { siteId } = req.params as { siteId: string };

    const status = await getSiteStatus(siteId);
    const value = `${status.uptimePercent.toFixed(1)}% uptime`;
    const color = uptimeColor(status.uptimePercent);

    const viewModel = buildBadgeViewModel('status', value, color);

    const svg = await ejs.renderFile(BADGE_TEMPLATE_PATH, viewModel, {
      async: true,
    });

    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).send(svg);
  } catch (err) {
    next(err);
  }
}