const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(Number.isFinite(totalSeconds) ? totalSeconds : 0));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours <= 0 && minutes <= 0) {
    return seconds > 0 ? '<1m' : '0m';
  }
  if (hours <= 0) {
    return `${minutes}m`;
  }
  return `${hours}h ${minutes}m`;
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '0%';
  const rounded = Math.round(value * 10) / 10;
  return `${rounded}%`;
}

export function weekdayLabel(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return WEEKDAYS[date.getDay()];
}

export function shortDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return `${date.getMonth() + 1}/${date.getDate()}`;
}
