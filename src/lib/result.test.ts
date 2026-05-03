import { describe, it, expect } from 'vitest';
import { type Result, ok, err, isOk, isErr } from './result';

describe('Result<T, E>', () => {
  describe('ok constructor', () => {
    it('creates a success result carrying the data', () => {
      const r = ok(42);
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.data).toBe(42);
      }
    });

    it('preserves complex data shapes', () => {
      const payload = { stops: [{ id: 'A', spaces: 8 }], refreshedAt: '2026-05-02T07:00:00Z' };
      const r = ok(payload);
      if (r.ok) {
        expect(r.data).toEqual(payload);
      }
    });
  });

  describe('err constructor', () => {
    it('creates a failure result carrying the error', () => {
      const r = err('boom');
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.error).toBe('boom');
      }
    });

    it('preserves discriminated error shapes', () => {
      const r = err({ code: 'PROVIDER_UNAVAILABLE' as const, message: 'down' });
      if (!r.ok) {
        expect(r.error.code).toBe('PROVIDER_UNAVAILABLE');
      }
    });
  });

  describe('isOk type guard', () => {
    it('returns true for success', () => {
      expect(isOk(ok(1))).toBe(true);
    });

    it('returns false for failure', () => {
      expect(isOk(err('x'))).toBe(false);
    });

    it('narrows to the success branch when true', () => {
      const r: Result<number, string> = ok(7);
      if (isOk(r)) {
        expect(r.data).toBe(7);
      } else {
        throw new Error('expected ok branch');
      }
    });
  });

  describe('isErr type guard', () => {
    it('returns true for failure', () => {
      expect(isErr(err('x'))).toBe(true);
    });

    it('returns false for success', () => {
      expect(isErr(ok(1))).toBe(false);
    });

    it('narrows to the failure branch when true', () => {
      const r: Result<number, string> = err('boom');
      if (isErr(r)) {
        expect(r.error).toBe('boom');
      } else {
        throw new Error('expected err branch');
      }
    });
  });

  describe('exhaustive narrowing via discriminated `ok` field', () => {
    it('narrows correctly when matching directly on result.ok', () => {
      function describeResult<T, E>(r: Result<T, E>): string {
        if (r.ok) return `success: ${JSON.stringify(r.data)}`;
        return `failure: ${JSON.stringify(r.error)}`;
      }

      expect(describeResult(ok({ id: 1 }))).toBe('success: {"id":1}');
      expect(describeResult(err({ code: 'X' }))).toBe('failure: {"code":"X"}');
    });

    it('supports both branches in a single function', () => {
      function unwrapOrDefault<T, E>(r: Result<T, E>, fallback: T): T {
        return r.ok ? r.data : fallback;
      }

      expect(unwrapOrDefault(ok(99), 0)).toBe(99);
      expect(unwrapOrDefault(err('boom') as Result<number, string>, 0)).toBe(0);
    });
  });
});
