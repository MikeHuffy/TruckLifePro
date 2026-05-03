import type { HosRemaining, HosState } from '@/types/hos';

/**
 * Pure functions for computing HOS countdown state.
 *
 * Modeled simply for the v1 informational timer:
 *   - 14-hour shift window from shift start (FMCSA shift limit)
 *   - 11-hour driving limit when duty status is "driving"
 *   - When driving, the binding limit is the lesser of remaining shift
 *     and remaining drive time
 *   - Off-duty / sleeper-berth still counts shift time (we don't model
 *     the 10-hour reset rule in v1)
 *
 * Real HOS is significantly more complex (per-day driving accumulation,
 * 30-minute break, 60/70-hour limits, sleeper-berth split). The
 * disclaimer (Story 2.4) makes the simplification explicit to drivers.
 */

const HOUR_MS = 60 * 60 * 1000;
export const SHIFT_LIMIT_MS = 14 * HOUR_MS;
export const DRIVE_LIMIT_MS = 11 * HOUR_MS;
export const AMBER_THRESHOLD_MS = 1 * HOUR_MS;

/** Compute remaining HOS time given current state and the current time. */
export function computeRemaining(state: HosState, nowMs: number): HosRemaining {
  const shiftStartMs = Date.parse(state.shiftStartIso);
  const elapsedMs = nowMs - shiftStartMs;
  const shiftRemainingMs = SHIFT_LIMIT_MS - elapsedMs;

  let remainingMs: number;
  let limit: HosRemaining['limit'];

  if (state.dutyStatus === 'driving') {
    const driveRemainingMs = DRIVE_LIMIT_MS - elapsedMs;
    if (driveRemainingMs <= shiftRemainingMs) {
      remainingMs = driveRemainingMs;
      limit = 'drive-11h';
    } else {
      remainingMs = shiftRemainingMs;
      limit = 'shift-14h';
    }
  } else {
    // For on-duty-not-driving, off-duty, sleeper-berth: track shift window.
    remainingMs = shiftRemainingMs;
    limit = 'shift-14h';
  }

  const exceeded = remainingMs <= 0;
  let warningLevel: HosRemaining['warningLevel'];
  if (exceeded) warningLevel = 'red';
  else if (remainingMs <= AMBER_THRESHOLD_MS) warningLevel = 'amber';
  else warningLevel = 'normal';

  return { remainingMs, limit, warningLevel, exceeded };
}

/** Format remaining time as `H:MM:SS` (or `0:00:00` if exceeded). */
export function formatRemaining(remainingMs: number): string {
  const ms = Math.max(0, remainingMs);
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${hours}:${pad(minutes)}:${pad(seconds)}`;
}
