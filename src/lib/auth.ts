import { createAuthClient } from '@neon/auth';
import { BetterAuthReactAdapter } from '@neon/auth/react/adapters';

// Neon Auth's base URL is public client configuration, not a database credential.
// The production default keeps Netlify working even when this VITE variable is unset;
// another branch or deployment can override it through VITE_NEON_AUTH_URL.
const authUrl = import.meta.env.VITE_NEON_AUTH_URL || 'https://ep-purple-shape-bemthc5c.neonauth.c-9.us-east-2.aws.neon.tech/neondb/auth';

export const authClient = createAuthClient(authUrl, {
  adapter: BetterAuthReactAdapter({ fetchOptions: { credentials: 'include' } }),
});

export async function getNeonAuthToken() {
  const { data, error } = await authClient.getSession();
  if (error) throw error;
  return data?.session?.token;
}
