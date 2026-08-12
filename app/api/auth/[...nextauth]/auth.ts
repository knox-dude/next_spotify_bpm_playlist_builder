// Disclaimer: Code partially taken from Next-Spotify-V2 (https://github.com/ankitk26/Next-Spotify-v2)

import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import SpotifyProvider from 'next-auth/providers/spotify';

const scope =
  'user-read-recently-played user-read-playback-state user-top-read user-modify-playback-state user-read-currently-playing user-follow-read playlist-read-private user-read-email user-read-private user-library-read playlist-read-collaborative playlist-modify-public playlist-modify-private';

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

/**
 * Trades the refresh token for a fresh access token.
 *
 * Spotify access tokens expire after an hour, which is easily less time than a
 * scan of a large library takes. Without this the user gets bounced to the
 * login page mid-scan and loses their results.
 *
 * @param {JWT} token - The current JWT, carrying the refresh token.
 * @return {Promise<JWT>} The refreshed JWT, or the original tagged with an
 *   error if the refresh failed.
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    if (!token.refreshToken) {
      throw new Error('No refresh token available');
    }

    const basic = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
    ).toString('base64');

    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken as string,
      }),
    });

    const refreshed = await response.json();

    if (!response.ok) {
      throw new Error(refreshed.error_description ?? 'Token refresh failed');
    }

    return {
      ...token,
      accessToken: refreshed.access_token,
      expires_at: Math.floor(Date.now() / 1000) + refreshed.expires_in,
      // Spotify only returns a new refresh token sometimes; keep the old one otherwise.
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      error: undefined,
    };
  } catch (error) {
    console.error('Failed to refresh Spotify access token:', error);
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID as string,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
      authorization: {
        params: { scope, show_dialog: true },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }) {
      // Initial sign-in: stash everything the refresh flow will need later.
      if (account) {
        token.id = account.id;
        token.expires_at = account.expires_at;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        return token;
      }

      // Still valid? Re-use it. The 60s margin avoids handing out a token that
      // expires while the request it was fetched for is still in flight.
      const expiresAt = (token.expires_at as number) ?? 0;
      if (Date.now() < (expiresAt - 60) * 1000) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      // Deliberately explicit: the refresh token must never reach the browser.
      session.user = {
        name: token.name,
        email: token.email,
        picture: token.picture,
        image: token.picture,
        sub: token.sub,
        accessToken: token.accessToken,
        expires_at: token.expires_at,
      } as typeof session.user;

      if (token.error) {
        (session as { error?: string }).error = token.error as string;
      }

      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
