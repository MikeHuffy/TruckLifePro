/**
 * Next.js instrumentation hook — runs once when the server (or a serverless
 * function instance) starts.
 *
 * Eagerly validates required environment variables so misconfig fails at
 * boot rather than at first user request.
 *
 * https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { parseEnv } = await import('@/lib/schemas/env');
    parseEnv(process.env);
  }
}
