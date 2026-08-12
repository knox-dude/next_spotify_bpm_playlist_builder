// Disclaimer: Code taken from Next-Spotify-V2 (https://github.com/ankitk26/Next-Spotify-v2)

'use server';

import { authOptions } from '../api/auth/[...nextauth]/auth';
import { AuthSession } from '../types/types';
import { getServerSession } from 'next-auth/next';

/** How many times to retry a request Spotify rate-limited. */
const MAX_RATE_LIMIT_RETRIES = 3;

export const customGet = async (url: string, session: AuthSession | null) => {
  if (!session) {
    return null;
  }

  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });

    // Scanning a large library runs long enough to get rate-limited; Spotify
    // tells us how long to wait in Retry-After (seconds).
    if (res.status === 429 && attempt < MAX_RATE_LIMIT_RETRIES) {
      const retryAfter = Number(res.headers.get('Retry-After')) || 1;
      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(retryAfter, 30) * 1000),
      );
      continue;
    }

    return res.json();
  }
};

export const getAuthSession = async () => {
  const session = (await getServerSession(authOptions)) as AuthSession | null;
  if (!session) {
    return null;
  }

  // Set when the refresh flow in auth.ts could not renew the access token, at
  // which point the only way forward is a fresh sign-in.
  if ((session as { error?: string }).error === 'RefreshAccessTokenError') {
    return null;
  }

  // expires_at is in seconds; Date.now() is in milliseconds.
  const currentTimestamp = Date.now();
  if (currentTimestamp >= session.user.expires_at * 1000) {
    return null;
  }

  return session;
};
