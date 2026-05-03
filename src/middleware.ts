import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Security headers applied to every response per architecture NFR-S5.
 *
 * CSP is intentionally permissive for v1 to avoid breaking Next.js dev
 * tooling (`unsafe-inline` for styles, `unsafe-eval` for the dev bundler).
 * Tighten with nonce-based CSP in a future hardening story when SSR nonce
 * propagation is wired up.
 */
const SECURITY_HEADERS: Record<string, string> = {
  'Strict-Transport-Security':
    'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
};

export function middleware(_request: NextRequest) {
  const response = NextResponse.next();

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  return response;
}

/**
 * Apply to every path except Next.js internals and static assets.
 * Static files are served by Vercel's CDN with their own headers; we don't
 * need to (and can't, for prefetched static assets) inject CSP there.
 */
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

// Exported for tests
export const __SECURITY_HEADERS__ = SECURITY_HEADERS;
