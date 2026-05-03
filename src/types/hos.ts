import type { z } from 'zod';
import type { hosStateSchema } from '@/lib/schemas/hos';

/** FMCSA Hours-of-Service duty statuses (informational use only). */
export type DutyStatus =
  | 'driving'
  | 'on-duty-not-driving'
  | 'off-duty'
  | 'sleeper-berth';

/** Persisted HOS state — stored in localStorage via useHosTimer. */
export type HosState = z.infer<typeof hosStateSchema>;

/** Computed remaining time for display in HosTimer. */
export interface HosRemaining {
  /** Milliseconds remaining; negative if the limit has been exceeded. */
  remainingMs: number;
  /** Which limit is active for the current duty status. */
  limit: 'drive-11h' | 'shift-14h';
  /** UI hint: amber under 1 hour, red at 0 or below. */
  warningLevel: 'normal' | 'amber' | 'red';
  /** True if the timer indicates an exceeded limit. */
  exceeded: boolean;
}
