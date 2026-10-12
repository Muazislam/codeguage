import type {
  SummaryRange,
  WakaTimeSummariesResponse,
  WakaTimeUser,
  WakaTimeUserResponse,
} from '../types';
import { base64Encode } from './base64';
import { AppError, classifyStatus } from './errors';

export const WAKATIME_API_BASE = 'https://wakatime.com/api/v1';

export type AuthHeader = Record<string, string>;

export function bearerHeader(token: string): AuthHeader {
  return { Authorization: `Bearer ${token.trim()}` };
}

export function apiKeyHeader(apiKey: string): AuthHeader {
  return { Authorization: `Basic ${base64Encode(apiKey.trim())}` };
}

export function summariesUrl(range: SummaryRange): string {
  return `${WAKATIME_API_BASE}/users/current/summaries?range=${range}`;
}

export function currentUserUrl(): string {
  return `${WAKATIME_API_BASE}/users/current`;
}

async function requestJson<T>(
  url: string,
  headers: AuthHeader,
  signal?: AbortSignal
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { method: 'GET', headers, signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    throw new AppError('network', 'Network request to WakaTime failed');
  }

  if (!response.ok) {
    let detail = '';
    try {
      detail = await response.text();
    } catch {
      detail = '';
    }
    const suffix = detail ? `: ${detail.slice(0, 200)}` : '';
    throw new AppError(
      classifyStatus(response.status),
      `WakaTime responded with ${response.status}${suffix}`,
      response.status
    );
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new AppError('bad_response', 'WakaTime returned an invalid JSON response');
  }
}

export async function fetchSummaries(
  headers: AuthHeader,
  range: SummaryRange,
  signal?: AbortSignal
): Promise<WakaTimeSummariesResponse> {
  return requestJson<WakaTimeSummariesResponse>(summariesUrl(range), headers, signal);
}

export async function fetchCurrentUser(
  headers: AuthHeader,
  signal?: AbortSignal
): Promise<WakaTimeUser> {
  const response = await requestJson<WakaTimeUserResponse>(currentUserUrl(), headers, signal);
  return response.data;
}
