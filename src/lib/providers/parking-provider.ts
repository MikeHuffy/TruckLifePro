import type { Result } from '@/lib/result';
import type {
  ParkingSearchInput,
  ParkingSearchResult,
} from '@/types/parking';
import type { AdapterError } from '@/types/adapter-error';

/**
 * Contract for any parking-data provider (TruckParkingClub today, possibly
 * a multi-source aggregator in Phase 3).
 *
 * Architectural rule (NFR-I4): the search UI and `/api/parking` route handler
 * depend on this interface only — they never import the concrete adapter.
 * Provider swap = swap the binding, leave the rest untouched.
 *
 * Architectural rule: never throw. All failures return `Result.err()`.
 */
export interface ParkingProvider {
  getResults(
    input: ParkingSearchInput,
  ): Promise<Result<ParkingSearchResult, AdapterError>>;
}
