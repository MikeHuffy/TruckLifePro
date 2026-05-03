'use client';

import { useCallback } from 'react';
import { useLocalStorage } from './use-local-storage';
import { hosStateSchema } from '@/lib/schemas/hos';
import type { DutyStatus, HosState } from '@/types/hos';

const STORAGE_KEY = 'tpp.hos-state.v1';
const ACK_KEY = 'tpp.hos-disclaimer-ack.v1';

/**
 * useHosTimer — wraps useLocalStorage with HOS-specific shape and helpers.
 *
 * State is `null` until the driver sets the timer via HosTimerForm.
 * Persistence is local-device only (architecture: no DB in MVP).
 *
 * Always pair the rendered timer with HosDisclaimer (FR9).
 */
export function useHosTimer() {
  const [rawState, setRawState] = useLocalStorage<HosState | null>(
    STORAGE_KEY,
    null,
  );

  // Defensive: if storage was tampered with, fall back to null
  const state =
    rawState === null
      ? null
      : (() => {
          const parsed = hosStateSchema.safeParse(rawState);
          return parsed.success ? parsed.data : null;
        })();

  const setTimer = useCallback(
    (input: { shiftStartIso: string; dutyStatus: DutyStatus }) => {
      const next: HosState = {
        shiftStartIso: input.shiftStartIso,
        dutyStatus: input.dutyStatus,
        setAtIso: new Date().toISOString(),
      };
      const validated = hosStateSchema.safeParse(next);
      if (!validated.success) {
        console.error('useHosTimer: invalid state, ignoring set', validated.error);
        return;
      }
      setRawState(validated.data);
    },
    [setRawState],
  );

  const reset = useCallback(() => {
    setRawState(null);
  }, [setRawState]);

  return { state, setTimer, reset };
}

/**
 * useHosDisclaimerAck — tracks whether the driver has acknowledged the
 * one-time HOS legal modal. Used by HosFirstUseModal (Story 2.4).
 */
export function useHosDisclaimerAck() {
  const [acknowledged, setAcknowledged] = useLocalStorage<boolean>(
    ACK_KEY,
    false,
  );

  const acknowledge = useCallback(() => {
    setAcknowledged(true);
  }, [setAcknowledged]);

  return { acknowledged, acknowledge };
}
