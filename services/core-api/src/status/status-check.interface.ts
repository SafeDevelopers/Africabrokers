/**
 * Status check result interface
 */
export interface StatusCheckResult {
  status: 'ok' | 'degraded' | 'down';
  latencyMs: number;
}

/**
 * Status check function interface
 * Each module should export a check function that implements this interface
 */
export type StatusCheck = () => Promise<StatusCheckResult>;

