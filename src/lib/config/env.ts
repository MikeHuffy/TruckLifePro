import 'server-only';
import { parseEnv } from '@/lib/schemas/env';

/**
 * Validated, server-side-only access to required environment variables.
 *
 * Imported by adapters and server actions that need provider credentials.
 * Module-level evaluation throws if any required var is missing — fails
 * fast at edge function cold-start rather than silently returning broken
 * responses.
 *
 * NEVER import this from a Client Component. Client-side reads must use
 * NEXT_PUBLIC_* vars (none currently defined).
 */
export const env = parseEnv(process.env);
