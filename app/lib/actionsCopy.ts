// Disclaimer: Code partially taken from Next-Spotify-V2 (https://github.com/ankitk26/Next-Spotify-v2)

import { AuthSession } from '@/app/types/types';
import {
  Album,
  Artist,
  Category,
  Playlist,
  PlaylistedTrack,
  Track,
  AudioFeatures,
  SimplifiedPlaylist,
} from '@/app/types/updatedTypes';
import { customGet } from '../utils/serverUtils';

export const createPlaylist = async (
  session: AuthSession,
  name: string,
): Promise<any> => {
  if (!session) {
    return null;
  }
  const res = await fetch(
    `https://api.spotify.com/v1/users/${session.user.sub}/playlists`,
    {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
      method: 'POST',
      body: JSON.stringify({ name }),
    },
  ).then((res) => res.json());
  return res;
};

export const addSongsToPlaylist = async (
  session: AuthSession,
  playlistId: string,
  tracks: string[],
): Promise<any> => {
  if (!session) {
    return null;
  }
  const results = [];
  while (tracks.length > 100) {
    let hundredTracks = tracks.slice(0, 100);
    let processedTracks = hundredTracks
      .map((trackId) => `spotify:track:${trackId}`)
      .join();
    const res = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
        },
        method: 'POST',
        body: JSON.stringify({
          uris: processedTracks,
        }),
      },
    ).then((res) => res.json());
    results.push(res);
    tracks = tracks.slice(100);
  }
  let processedTracks = tracks.map((trackId) => `spotify:track:${trackId}`);
  const res = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
      method: 'POST',
      body: JSON.stringify({
        uris: processedTracks,
      }),
    },
  ).then((res) => res.json());
  results.push(res);
  return results;
};

export const getTopItems = async ({
  session,
  timeRange = 'short_term',
  limit = 50,
  type,
}: {
  session: AuthSession;
  timeRange?: string;
  limit?: number;
  type: 'artists' | 'tracks';
}) => {
  return customGet(
    `https://api.spotify.com/v1/me/top/${type}?time_range=${timeRange}&limit=${limit}`,
    session,
  );
};

export const getAllUserLikedPlaylists = async (
  session: AuthSession,
): Promise<SimplifiedPlaylist[]> => {
  const data = await customGet(
    'https://api.spotify.com/v1/me/playlists?limit=50',
    session,
  );

  let limit = 50;
  let currUrl = data.next;

  while (currUrl !== null) {
    const nextData = await customGet(currUrl, session);
    data.items.push(...nextData.items);
    limit += 50;
    currUrl = nextData.next;
  }

  return data.items;
};

export const getTrackById = async (
  session: AuthSession,
  trackId: string,
): Promise<Track> => {
  return customGet(`https://api.spotify.com/v1/tracks/${trackId}`, session);
};

export const getTrackFromPlaylistLink = async (
  session: AuthSession,
  playlistLink: string,
): Promise<PlaylistedTrack[]> => {
  const data = await customGet(`${playlistLink}?limit=100`, session);

  let limit = 100;
  let currUrl = data.next;

  while (currUrl !== null) {
    const nextData = await customGet(currUrl, session);
    data.items.push(...nextData.items);
    limit += 100;
    currUrl = nextData.next;
  }

  return data.items;
};

export const getTrackAnalysis = async (
  session: AuthSession,
  trackId: string,
): Promise<AudioFeatures> => {
  return customGet(
    `https://api.spotify.com/v1/audio-features/${trackId}`,
    session,
  );
};

export const getManyTrackAnalysis = async (
  session: AuthSession,
  trackIds: string[],
): Promise<AudioFeatures[]> => {
  const joinedIds = trackIds.join(',');
  return customGet(
    `https://api.spotify.com/v1/audio-features?ids=${joinedIds}`,
    session,
  ).then((data) => data.audio_features);
};
