import { z } from 'zod';

/**
 * HOS state Zod schema — single source of truth for the persisted shape.
 *
 * Note: this is informational only (NOT an ELD per FR9). The disclaimer
 * shown alongside any HOS surface makes that explicit.
 */

export const dutyStatusSchema = z.enum([
  'driving',
  'on-duty-not-driving',
  'off-duty',
  'sleeper-berth',
]);

export const hosStateSchema = z.object({
  /** ISO 8601 timestamp of when the current shift began. */
  shiftStartIso: z.iso.datetime(),
  /** Current driver duty status. */
  dutyStatus: dutyStatusSchema,
  /** ISO 8601 timestamp of when this state was last set/edited. */
  setAtIso: z.iso.datetime(),
});
