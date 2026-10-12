export type BreakdownKind = 'languages' | 'projects' | 'editors';

export type SummaryRange = 'today' | 'last_7_days' | 'last_30_days';

export interface WakaTimeDuration {
  total_seconds: number;
  text: string;
  hours?: number;
  minutes?: number;
  seconds?: number;
  decimal?: string;
  digital?: string;
}

export interface WakaTimeBreakdownItem extends WakaTimeDuration {
  name: string;
  percent?: number;
}

export interface WakaTimeRange {
  date: string;
  start: string;
  end: string;
  timezone?: string;
  text?: string;
}

export interface WakaTimeSummary {
  grand_total: WakaTimeDuration;
  range: WakaTimeRange;
  categories?: WakaTimeBreakdownItem[];
  dependencies?: WakaTimeBreakdownItem[];
  editors?: WakaTimeBreakdownItem[];
  languages?: WakaTimeBreakdownItem[];
  machines?: WakaTimeBreakdownItem[];
  operating_systems?: WakaTimeBreakdownItem[];
  projects?: WakaTimeBreakdownItem[];
}

export interface WakaTimeSummariesResponse {
  data: WakaTimeSummary[];
  cumulative_total?: WakaTimeDuration;
  daily_average?: WakaTimeDuration;
}

export interface WakaTimeUser {
  id: string;
  display_name: string;
  username?: string;
  email?: string;
  photo?: string;
}

export interface WakaTimeUserResponse {
  data: WakaTimeUser;
}

export interface BreakdownEntry {
  name: string;
  seconds: number;
  percent: number;
}

export interface DailyPoint {
  date: string;
  label: string;
  seconds: number;
}

export type BreakdownsByRange = Record<SummaryRange, Record<BreakdownKind, BreakdownEntry[]>>;

export interface DashboardData {
  todaySeconds: number;
  sevenDaySeconds: number;
  thirtyDaySeconds: number;
  sevenDayAverageSeconds: number;
  daily: DailyPoint[];
  breakdowns: BreakdownsByRange;
  fetchedAt: number;
}
