import type { Request, Response, NextFunction } from 'express';
import ejs from 'ejs';
import path from 'node:path';
import { getSiteStatus } from '../services/status.service.js';
import type { StatusPageViewModel } from '../types/status.types.js';

const STATUS_TEMPLATE_PATH = path.join(__dirname, '..', 'views', 'status.ejs');

function statusLabelAndColor(uptimePercent: number): {
  label: string;
  color: string;
} {
  if (uptimePercent >= 99) return { label: 'Operational', color: '#4c1' };
  if (uptimePercent >= 95) return { label: 'Degraded', color: '#dfb317' };
  return { label: 'Outage', color: '#e05d44' };
}

export async function statusController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { siteId } = req.params as { siteId: string };

    const status = await getSiteStatus(siteId);
    const { label, color } = statusLabelAndColor(status.uptimePercent);

    const viewModel: StatusPageViewModel = {
      ...status,
      statusLabel: label,
      statusColor: color,
      badgeUrl: `/badge/${encodeURIComponent(siteId)}`,
    };

    const html = await ejs.renderFile(STATUS_TEMPLATE_PATH, viewModel, {
      async: true,
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (err) {
    next(err);
  }
}