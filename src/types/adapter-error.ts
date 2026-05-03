/**
 * Shared error type for every external-service adapter (parking, email,
 * future analytics, etc.).
 *
 * Adapters never throw — they return `Result.err(adapterError)`. Components
 * and callers narrow on `code` to render explicit error states. Each adapter
 * only emits codes relevant to its provider.
 *
 * Codes:
 *   - PROVIDER_UNAVAILABLE — 5xx, timeout, network failure
 *   - NOT_FOUND            — upstream returned 404 in a semantic-not-found sense
 *   - RATE_LIMITED         — upstream returned 429
 *   - MALFORMED_RESPONSE   — upstream returned data we can't parse with Zod
 *   - UNAUTHORIZED         — upstream rejected our credentials
 *   - INVALID_EMAIL        — email-specific: provider rejected the email format
 *   - LIST_FULL            — email-specific: list capacity reached
 */
export type AdapterErrorCode =
  | 'PROVIDER_UNAVAILABLE'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'MALFORMED_RESPONSE'
  | 'UNAUTHORIZED'
  | 'INVALID_EMAIL'
  | 'LIST_FULL';

export interface AdapterError {
  code: AdapterErrorCode;
  /** Human-readable message — safe to log; not for end-user display. */
  message: string;
  /** Optional underlying error for debugging. Never surface to end users. */
  cause?: unknown;
}
