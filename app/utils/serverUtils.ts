// Disclaimer: Code taken from Next-Spotify-V2 (https://github.com/ankitk26/Next-Spotify-v2)

"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { AuthSession } from "@/app/types/types";
import { getServerSession } from "next-auth/next";

export const customGet = async (url: string, session: AuthSession | null) => {
  if (!session) {
    return null;
  }
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${session.user.accessToken}`,
    },
  }).then((res) => res.json());

  return res;
};

export const getAuthSession = async () => {
  const session = (await getServerSession(authOptions)) as AuthSession;
  if (!session) {
    return null;
  }

  const currentTimestamp = Math.floor(Date.now());
  if (currentTimestamp >= session.user.expires_at * 1000) {
    return null;
  }

  return session;
};
