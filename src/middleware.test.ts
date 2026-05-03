import { describe, it, expect } from 'vitest';
import { __SECURITY_HEADERS__ } from './middleware';

describe('security headers (NFR-S5)', () => {
  it('includes Strict-Transport-Security with long max-age, includeSubDomains, and preload', () => {
    const hsts = __SECURITY_HEADERS__['Strict-Transport-Security'];
    expect(hsts).toContain('max-age=');
    expect(hsts).toContain('includeSubDomains');
    expect(hsts).toContain('preload');
    // Two-year HSTS minimum is the modern recommended floor
    const maxAgeMatch = hsts.match(/max-age=(\d+)/);
    expect(maxAgeMatch).not.toBeNull();
    expect(Number(maxAgeMatch![1])).toBeGreaterThanOrEqual(63072000);
  });

  it('sets X-Content-Type-Options to nosniff', () => {
    expect(__SECURITY_HEADERS__['X-Content-Type-Options']).toBe('nosniff');
  });

  it('sets Referrer-Policy to strict-origin-when-cross-origin', () => {
    expect(__SECURITY_HEADERS__['Referrer-Policy']).toBe(
      'strict-origin-when-cross-origin',
    );
  });

  it('disables camera, microphone, and geolocation via Permissions-Policy (privacy stance — FR29)', () => {
    const perms = __SECURITY_HEADERS__['Permissions-Policy'];
    expect(perms).toContain('camera=()');
    expect(perms).toContain('microphone=()');
    expect(perms).toContain('geolocation=()');
  });

  it('sets a Content-Security-Policy header with frame-ancestors none', () => {
    const csp = __SECURITY_HEADERS__['Content-Security-Policy'];
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
  });

  it('CSP allows HTTPS images and connections (TruckParkingClub data, OG card images, etc.)', () => {
    const csp = __SECURITY_HEADERS__['Content-Security-Policy'];
    expect(csp).toContain("img-src 'self' data: blob: https:");
    expect(csp).toContain("connect-src 'self' https:");
  });

  it('exports exactly the five expected security headers (no accidental extras)', () => {
    expect(Object.keys(__SECURITY_HEADERS__).sort()).toEqual([
      'Content-Security-Policy',
      'Permissions-Policy',
      'Referrer-Policy',
      'Strict-Transport-Security',
      'X-Content-Type-Options',
    ]);
  });
});
