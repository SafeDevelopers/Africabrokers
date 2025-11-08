/**
 * Status check result interface
 */
export interface StatusCheckResult {
  status: 'ok' | 'degraded' | 'down';
  latencyMs: number;
}

/**
 * Status check interface
 * Each module should export a class that implements this interface
 */
export interface StatusCheck {
  check(): Promise<StatusCheckResult>;
}

