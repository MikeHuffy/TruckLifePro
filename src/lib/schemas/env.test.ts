import { describe, it, expect } from 'vitest';
import { parseEnv, envSchema } from './env';

describe('parseEnv', () => {
  const validEnv = {
    TRUCKPARKINGCLUB_API_KEY: 'tpc_test_key',
    MAILCHIMP_API_KEY: 'mc_test_key',
    MAILCHIMP_LIST_ID: 'list_abc123',
  };

  it('returns the parsed env when all required vars are present', () => {
    const env = parseEnv(validEnv);
    expect(env.TRUCKPARKINGCLUB_API_KEY).toBe('tpc_test_key');
    expect(env.MAILCHIMP_API_KEY).toBe('mc_test_key');
    expect(env.MAILCHIMP_LIST_ID).toBe('list_abc123');
  });

  it('throws when TRUCKPARKINGCLUB_API_KEY is missing', () => {
    const incomplete = { ...validEnv, TRUCKPARKINGCLUB_API_KEY: undefined };
    expect(() => parseEnv(incomplete)).toThrow(/TRUCKPARKINGCLUB_API_KEY/);
  });

  it('throws when MAILCHIMP_API_KEY is missing', () => {
    const incomplete = { ...validEnv, MAILCHIMP_API_KEY: undefined };
    expect(() => parseEnv(incomplete)).toThrow(/MAILCHIMP_API_KEY/);
  });

  it('throws when MAILCHIMP_LIST_ID is missing', () => {
    const incomplete = { ...validEnv, MAILCHIMP_LIST_ID: undefined };
    expect(() => parseEnv(incomplete)).toThrow(/MAILCHIMP_LIST_ID/);
  });

  it('throws when a required var is empty string', () => {
    const incomplete = { ...validEnv, TRUCKPARKINGCLUB_API_KEY: '' };
    expect(() => parseEnv(incomplete)).toThrow(/TRUCKPARKINGCLUB_API_KEY/);
  });

  it('lists every missing var in a single error (fail fast with full picture)', () => {
    let captured: Error | null = null;
    try {
      parseEnv({});
    } catch (e) {
      captured = e as Error;
    }
    expect(captured).not.toBeNull();
    expect(captured!.message).toContain('TRUCKPARKINGCLUB_API_KEY');
    expect(captured!.message).toContain('MAILCHIMP_API_KEY');
    expect(captured!.message).toContain('MAILCHIMP_LIST_ID');
  });

  it('error message points operator to .env.local and Vercel dashboard', () => {
    expect(() => parseEnv({})).toThrow(/\.env\.local|Vercel/);
  });

  it('ignores extra unknown env vars (does not throw on unrelated PATH, HOME, etc.)', () => {
    const withExtras = {
      ...validEnv,
      PATH: '/usr/bin',
      HOME: '/root',
      RANDOM_OTHER_VAR: 'whatever',
    };
    expect(() => parseEnv(withExtras)).not.toThrow();
  });
});

describe('envSchema', () => {
  it('exports a Zod schema (used directly by tools that need the schema, not just parsed output)', () => {
    expect(envSchema).toBeDefined();
    expect(typeof envSchema.safeParse).toBe('function');
  });
});
