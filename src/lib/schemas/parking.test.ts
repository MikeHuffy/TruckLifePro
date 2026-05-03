import { describe, it, expect } from 'vitest';
import {
  parkingSearchInputSchema,
  truckStopSchema,
  parkingSearchResultSchema,
} from './parking';

describe('parkingSearchInputSchema', () => {
  it('accepts valid exit number and 2-letter state', () => {
    const result = parkingSearchInputSchema.safeParse({
      exit: '284',
      state: 'IA',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.exit).toBe('284');
      expect(result.data.state).toBe('IA');
    }
  });

  it('uppercases lowercase state input', () => {
    const result = parkingSearchInputSchema.safeParse({
      exit: '12',
      state: 'mt',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.state).toBe('MT');
    }
  });

  it('accepts alphanumeric exits with dashes (e.g., "12A", "5-7")', () => {
    expect(
      parkingSearchInputSchema.safeParse({ exit: '12A', state: 'CA' }).success,
    ).toBe(true);
    expect(
      parkingSearchInputSchema.safeParse({ exit: '5-7', state: 'CA' }).success,
    ).toBe(true);
  });

  it('rejects empty exit', () => {
    const result = parkingSearchInputSchema.safeParse({
      exit: '',
      state: 'IA',
    });
    expect(result.success).toBe(false);
  });

  it('rejects state codes that are not 2 letters', () => {
    expect(
      parkingSearchInputSchema.safeParse({ exit: '1', state: 'IOWA' }).success,
    ).toBe(false);
    expect(
      parkingSearchInputSchema.safeParse({ exit: '1', state: 'I' }).success,
    ).toBe(false);
  });

  it('rejects exits with spaces or special characters', () => {
    expect(
      parkingSearchInputSchema.safeParse({ exit: '12 A', state: 'CA' }).success,
    ).toBe(false);
    expect(
      parkingSearchInputSchema.safeParse({ exit: '12;DROP', state: 'CA' })
        .success,
    ).toBe(false);
  });
});

describe('truckStopSchema', () => {
  const valid = {
    id: 'tpc_iowa80',
    name: 'Iowa 80 Truckstop',
    address: '755 W Iowa 80 Rd, Walcott, IA 52773',
    phone: '+15632846961',
    priceUsd: 25,
    availableSpaces: 14,
    totalSpaces: 40,
    distanceMiles: 28,
    lat: 41.6098,
    lng: -90.7706,
    amenities: ['restrooms', 'shower', 'fuel'],
  };

  it('accepts a complete, valid truck stop', () => {
    expect(truckStopSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts a stop with a null phone (some stops have no phone listed)', () => {
    expect(
      truckStopSchema.safeParse({ ...valid, phone: null }).success,
    ).toBe(true);
  });

  it('defaults amenities to an empty array when omitted', () => {
    const { amenities: _, ...withoutAmenities } = valid;
    const result = truckStopSchema.safeParse(withoutAmenities);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amenities).toEqual([]);
    }
  });

  it('rejects negative prices', () => {
    expect(
      truckStopSchema.safeParse({ ...valid, priceUsd: -1 }).success,
    ).toBe(false);
  });

  it('rejects fractional space counts', () => {
    expect(
      truckStopSchema.safeParse({ ...valid, availableSpaces: 3.5 }).success,
    ).toBe(false);
  });

  it('rejects out-of-range latitude/longitude', () => {
    expect(truckStopSchema.safeParse({ ...valid, lat: 91 }).success).toBe(false);
    expect(truckStopSchema.safeParse({ ...valid, lng: -181 }).success).toBe(
      false,
    );
  });
});

describe('parkingSearchResultSchema', () => {
  it('accepts an empty results array (legitimate "no parking near this exit" response)', () => {
    const result = parkingSearchResultSchema.safeParse({
      results: [],
      refreshedAt: '2026-05-03T10:00:00Z',
      cached: false,
    });
    expect(result.success).toBe(true);
  });

  it('requires refreshedAt to be a valid ISO 8601 datetime', () => {
    const result = parkingSearchResultSchema.safeParse({
      results: [],
      refreshedAt: 'not-a-date',
      cached: false,
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing cached flag (callers must always know cache state)', () => {
    const result = parkingSearchResultSchema.safeParse({
      results: [],
      refreshedAt: '2026-05-03T10:00:00Z',
    });
    expect(result.success).toBe(false);
  });
});
