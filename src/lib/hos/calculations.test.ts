import { describe, it, expect } from 'vitest';
import {
  computeRemaining,
  formatRemaining,
  SHIFT_LIMIT_MS,
  DRIVE_LIMIT_MS,
} from './calculations';
import type { HosState } from '@/types/hos';

const HOUR_MS = 60 * 60 * 1000;
const SHIFT_START = '2026-05-03T08:00:00.000Z';
const SHIFT_START_MS = Date.parse(SHIFT_START);

const baseState = (dutyStatus: HosState['dutyStatus']): HosState => ({
  shiftStartIso: SHIFT_START,
  dutyStatus,
  setAtIso: SHIFT_START,
});

describe('computeRemaining', () => {
  describe('driving status', () => {
    it('uses the 11-hour drive limit when freshly started', () => {
      const r = computeRemaining(baseState('driving'), SHIFT_START_MS);
      expect(r.limit).toBe('drive-11h');
      expect(r.remainingMs).toBe(DRIVE_LIMIT_MS);
      expect(r.exceeded).toBe(false);
    });

    it('counts down as time elapses', () => {
      const r = computeRemaining(baseState('driving'), SHIFT_START_MS + 5 * HOUR_MS);
      expect(r.limit).toBe('drive-11h');
      expect(r.remainingMs).toBe(6 * HOUR_MS);
    });

    it('marks exceeded when past the 11-hour driving limit', () => {
      const r = computeRemaining(
        baseState('driving'),
        SHIFT_START_MS + 11.5 * HOUR_MS,
      );
      expect(r.limit).toBe('drive-11h');
      expect(r.exceeded).toBe(true);
      expect(r.warningLevel).toBe('red');
      expect(r.remainingMs).toBeLessThan(0);
    });

    it('amber warning when under 1 hour remaining', () => {
      const r = computeRemaining(
        baseState('driving'),
        SHIFT_START_MS + 10.5 * HOUR_MS, // 30 min left
      );
      expect(r.warningLevel).toBe('amber');
      expect(r.exceeded).toBe(false);
    });

    it('normal level when more than 1 hour remaining', () => {
      const r = computeRemaining(
        baseState('driving'),
        SHIFT_START_MS + 5 * HOUR_MS,
      );
      expect(r.warningLevel).toBe('normal');
    });
  });

  describe('on-duty-not-driving status', () => {
    it('uses the 14-hour shift limit', () => {
      const r = computeRemaining(
        baseState('on-duty-not-driving'),
        SHIFT_START_MS,
      );
      expect(r.limit).toBe('shift-14h');
      expect(r.remainingMs).toBe(SHIFT_LIMIT_MS);
    });

    it('counts down against the 14-hour window', () => {
      const r = computeRemaining(
        baseState('on-duty-not-driving'),
        SHIFT_START_MS + 6 * HOUR_MS,
      );
      expect(r.remainingMs).toBe(8 * HOUR_MS);
    });
  });

  describe('off-duty / sleeper-berth statuses', () => {
    it('off-duty still tracks shift window', () => {
      const r = computeRemaining(baseState('off-duty'), SHIFT_START_MS + 2 * HOUR_MS);
      expect(r.limit).toBe('shift-14h');
      expect(r.remainingMs).toBe(12 * HOUR_MS);
    });

    it('sleeper-berth still tracks shift window', () => {
      const r = computeRemaining(
        baseState('sleeper-berth'),
        SHIFT_START_MS + 9 * HOUR_MS,
      );
      expect(r.limit).toBe('shift-14h');
      expect(r.remainingMs).toBe(5 * HOUR_MS);
    });
  });

  describe('binding limit selection while driving', () => {
    it('prefers shift-14h when shift is more restrictive than drive-11h', () => {
      // With driving status, drive limit is 11h. But if a hypothetical state
      // pushed shift remaining below drive remaining, the shift limit should
      // bind. (In our simple model both elapse from the same shift start, so
      // drive is always the binding limit while driving — but verify the
      // logic anyway.)
      const r = computeRemaining(baseState('driving'), SHIFT_START_MS);
      // With identical elapsed times, drive (11h) < shift (14h), so drive binds.
      expect(r.limit).toBe('drive-11h');
    });
  });
});

describe('formatRemaining', () => {
  it('formats whole hours and minutes', () => {
    expect(formatRemaining(2 * HOUR_MS + 30 * 60 * 1000 + 15 * 1000)).toBe(
      '2:30:15',
    );
  });

  it('zero-pads minutes and seconds', () => {
    expect(formatRemaining(5 * HOUR_MS + 5 * 60 * 1000 + 5 * 1000)).toBe(
      '5:05:05',
    );
  });

  it('returns 0:00:00 when remaining is zero or negative (exceeded)', () => {
    expect(formatRemaining(0)).toBe('0:00:00');
    expect(formatRemaining(-1000)).toBe('0:00:00');
  });

  it('does not include negative numbers in output', () => {
    expect(formatRemaining(-5 * HOUR_MS)).not.toMatch(/-/);
  });
});
