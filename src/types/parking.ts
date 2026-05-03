import type { z } from 'zod';
import type {
  parkingSearchInputSchema,
  truckStopSchema,
  parkingSearchResultSchema,
} from '@/lib/schemas/parking';

/**
 * Parking domain types — inferred from Zod schemas in
 * `src/lib/schemas/parking.ts` so the schema is the single source of truth.
 *
 * Import these types from anywhere; import the Zod schemas only when you
 * need to actually parse data at a boundary.
 */

export type ParkingSearchInput = z.infer<typeof parkingSearchInputSchema>;
export type TruckStop = z.infer<typeof truckStopSchema>;
export type ParkingSearchResult = z.infer<typeof parkingSearchResultSchema>;
