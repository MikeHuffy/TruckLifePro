/**
 * Result<T, E> — discriminated union for operations that can succeed or fail
 * without throwing.
 *
 * Used at every external-service boundary per architecture NFR-I4 and the
 * project-wide pattern: never throw from adapters; always return Result.
 *
 * Narrow via the `ok` field:
 *
 *   const r = await provider.getData();
 *   if (!r.ok) return <ErrorState error={r.error} />;
 *   return <Data value={r.data} />;
 */
export type Result<T, E> =
  | { ok: true; data: T }
  | { ok: false; error: E };

/** Construct a success result. */
export function ok<T>(data: T): Result<T, never> {
  return { ok: true, data };
}

/** Construct a failure result. */
export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

/** Type guard: result is a success. */
export function isOk<T, E>(
  result: Result<T, E>,
): result is { ok: true; data: T } {
  return result.ok;
}

/** Type guard: result is a failure. */
export function isErr<T, E>(
  result: Result<T, E>,
): result is { ok: false; error: E } {
  return !result.ok;
}
