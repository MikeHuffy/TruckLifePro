import { z } from 'zod';

/**
 * Required environment variables for the app to start.
 *
 * Add new required vars here AND set them in:
 *   - .env.local (gitignored, local dev)
 *   - Vercel project settings (preview + production)
 */
export const envSchema = z.object({
  TRUCKPARKINGCLUB_API_KEY: z
    .string()
    .min(1, 'TRUCKPARKINGCLUB_API_KEY is required'),
  MAILCHIMP_API_KEY: z.string().min(1, 'MAILCHIMP_API_KEY is required'),
  MAILCHIMP_LIST_ID: z.string().min(1, 'MAILCHIMP_LIST_ID is required'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables.
 *
 * Throws a clear, multi-line error naming every missing or invalid var.
 * Designed to fail fast at app startup (instrumentation.ts) so misconfig
 * is impossible to ship silently.
 */
export function parseEnv(input: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(input);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(
      `\nEnvironment configuration invalid:\n${issues}\n\n` +
        `Set missing vars in .env.local (dev) or in the Vercel dashboard ` +
        `(preview + production).\n`,
    );
  }
  return result.data;
}
