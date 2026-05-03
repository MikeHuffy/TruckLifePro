import { z } from 'zod';

/**
 * Parking domain Zod schemas — the single source of truth for parking data
 * shapes. TypeScript types in `src/types/parking.ts` are inferred from these
 * via `z.infer<typeof ...>`.
 *
 * Used by:
 *   - TruckParkingClubAdapter (validates upstream API response)
 *   - /api/parking edge handler (validates query params)
 *   - /search page (validates URL search params)
 */

const US_STATE_REGEX = /^[A-Z]{2}$/;

/** Search query input from URL params or form submission. */
export const parkingSearchInputSchema = z.object({
  exit: z
    .string()
    .min(1, 'exit is required')
    .max(10, 'exit too long')
    .regex(/^[A-Za-z0-9-]+$/, 'exit must be alphanumeric (digits and dashes)'),
  state: z
    .string()
    .toUpperCase()
    .pipe(
      z
        .string()
        .regex(US_STATE_REGEX, 'state must be a 2-letter US state code'),
    ),
});

/** Single truck stop returned by the data provider. */
export const truckStopSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().nullable(),
  /** Price per night in USD. */
  priceUsd: z.number().nonnegative(),
  availableSpaces: z.number().int().nonnegative(),
  totalSpaces: z.number().int().nonnegative(),
  /** Driving distance from the queried exit, in miles. */
  distanceMiles: z.number().nonnegative(),
  /** Decimal-degree latitude. */
  lat: z.number().min(-90).max(90),
  /** Decimal-degree longitude. */
  lng: z.number().min(-180).max(180),
  /** Optional amenities list (restrooms, shower, fuel, etc.). */
  amenities: z.array(z.string()).default([]),
});

/** Full search response payload. */
export const parkingSearchResultSchema = z.object({
  results: z.array(truckStopSchema),
  /** ISO 8601 timestamp of when this data was fetched from the upstream. */
  refreshedAt: z.iso.datetime(),
  /** True if this response came from edge cache rather than a fresh upstream call. */
  cached: z.boolean(),
});
