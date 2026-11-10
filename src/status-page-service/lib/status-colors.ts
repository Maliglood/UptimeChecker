/**
 * Палитра статусов в стиле shields.io.
 */
export const STATUS_COLORS = {
  operational: '#4c1',
  degraded: '#dfb317',
  outage: '#e05d44',
} as const;

export type StatusLevel = keyof typeof STATUS_COLORS;