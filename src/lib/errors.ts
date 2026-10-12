export type AppErrorType =
  | 'auth'
  | 'network'
  | 'rate_limit'
  | 'server'
  | 'bad_response'
  | 'unknown';

export class AppError extends Error {
  type: AppErrorType;
  status?: number;

  constructor(type: AppErrorType, message: string, status?: number) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.status = status;
  }
}

export function classifyStatus(status: number): AppErrorType {
  if (status === 401 || status === 403) return 'auth';
  if (status === 429) return 'rate_limit';
  if (status >= 500) return 'server';
  return 'unknown';
}

export function userMessage(error: unknown): string {
  if (error instanceof AppError) {
    switch (error.type) {
      case 'auth':
        return 'Your WakaTime authorization has expired. Please reconnect your account.';
      case 'network':
        return 'Could not reach WakaTime. Check your internet connection and try again.';
      case 'rate_limit':
        return 'WakaTime is rate limiting requests right now. Wait a moment and refresh.';
      case 'server':
        return 'WakaTime is having trouble right now. Please try again shortly.';
      case 'bad_response':
        return 'WakaTime returned an unexpected response. Please try refreshing.';
      default:
        return 'Something went wrong while loading your stats. Please try again.';
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}
