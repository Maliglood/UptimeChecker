export interface SiteStatusData {
  siteId: string;
  siteName: string;
  uptimePercent: number;
  totalChecks: number;
  successfulChecks: number;
}

export interface BadgeViewModel {
  label: string;
  value: string;
  color: string;
  labelWidth: number;
  valueWidth: number;
  totalWidth: number;
}

export interface StatusPageViewModel extends SiteStatusData {
  statusLabel: string;
  statusColor: string;
  badgeUrl: string;
}