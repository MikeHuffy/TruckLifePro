'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * useLocalStorage<T> — persistent client-side state with SSR-safe hydration.
 *
 * Returns `[value, setValue]` like useState. On the server (SSR) and during
 * the initial client render, returns `defaultValue` to avoid hydration
 * mismatch. After mount, reads from localStorage and updates state.
 *
 * Failures (QuotaExceededError, SecurityError, disabled storage) are
 * logged via console.error and fall back to in-memory state — never
 * throw. This is the pattern for favorites (FR10–13) and the HOS timer
 * (FR6–8).
 *
 * Architecture note: there is no backend database in MVP. This hook is
 * the persistence layer for both favorites and HOS timer state.
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(defaultValue);

  // Read from localStorage after mount. Initial render returns defaultValue
  // so SSR and first client render match.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) {
        setValue(JSON.parse(stored) as T);
      }
    } catch (error) {
      console.error(`useLocalStorage: failed to read "${key}"`, error);
    }
    // We intentionally don't include defaultValue in deps — it should only
    // be used on first mount, not when the consumer happens to pass a new
    // reference for the same key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = useCallback<(next: T | ((prev: T) => T)) => void>(
    (next) => {
      setValue((prev) => {
        const resolved =
          typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch (error) {
          // QuotaExceededError, SecurityError (private mode, disabled
          // storage), serialization errors — fall back to in-memory only.
          console.error(`useLocalStorage: failed to write "${key}"`, error);
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, set];
}
