// Disclaimer: Code partially taken from Next-Spotify-V2 (https://github.com/ankitk26/Next-Spotify-v2)

// Everything here runs on the server. That matters for more than secrecy: these
// functions page through Spotify from inside a single request, so fetching a
// 2,000-track library costs the browser one round trip instead of forty.
'use server';

import { AuthSession } from '../types/types';
import {
  Artist,
  PlaylistedTrack,
  Track,
  SavedTrack,
  SimplifiedPlaylist,
} from '../types/updatedTypes';
import { customGet } from '../utils/serverUtils';
import { chunkArray, mapWithConcurrency } from './concurrency';

/**
 * How many pages of one paging object to request at a time.
 *
 * The caller fetches several sources at once (SOURCE_CONCURRENCY), so the real
 * ceiling is this times that - around 20 Spotify requests in flight at the peak
 * of a big scan. Spotify's limit is a rolling 30-second window rather than a
 * fixed rate and customGet backs off on a 429, so bursts are survivable; this is
 * about not making a habit of them.
 */
const PAGE_CONCURRENCY = 5;

/** Spotify's cap for `/artists?ids=`. */
const ARTIST_BATCH_SIZE = 50;

/** Returns `url` with `offset` set to the given value. */
const withOffset = (url: string, offset: number): string => {
  const parsed = new URL(url);
  parsed.searchParams.set('offset', String(offset));
  return parsed.toString();
};

/**
 * Walks a Spotify paging object to the end, collecting every page's items.
 *
 * The first page tells us `total` and `limit`, which is enough to address every
 * remaining page by offset directly. That turns a chain of dependent requests
 * (each one waiting on the previous page's `next` link) into one request plus a
 * parallel fan-out — the difference between ~40 serial round trips and ~7 for a
 * large Liked Songs library.
 *
 * @param {AuthSession} session - The session object containing the user's authentication information.
 * @param {string} firstUrl - The URL of the first page.
 * @return {Promise<any[]>} A promise that resolves to every item across all pages, in order.
 */
const collectAllPages = async (
  session: AuthSession,
  firstUrl: string,
): Promise<any[]> => {
  const firstPage = await customGet(firstUrl, session);
  if (!firstPage?.items) {
    return [];
  }

  const items: any[] = [...firstPage.items];
  const limit: number = firstPage.limit || firstPage.items.length;
  const total: number = firstPage.total ?? items.length;
  const start: number = (firstPage.offset ?? 0) + limit;

  // Endpoints that report no usable total still have to be walked link by link.
  if (!limit || firstPage.total === undefined) {
    let nextUrl: string | null = firstPage.next ?? null;
    while (nextUrl) {
      const page = await customGet(nextUrl, session);
      if (!page?.items) {
        break;
      }
      items.push(...page.items);
      nextUrl = page.next ?? null;
    }
    return items;
  }

  const offsets: number[] = [];
  for (let offset = start; offset < total; offset += limit) {
    offsets.push(offset);
  }

  // mapWithConcurrency preserves input order, so pages land in Spotify's order.
  const pages = await mapWithConcurrency(offsets, PAGE_CONCURRENCY, (offset) =>
    customGet(withOffset(firstUrl, offset), session),
  );

  for (const page of pages) {
    if (page?.items) {
      items.push(...page.items);
    }
  }

  return items;
};

/**
 * Creates a new playlist on Spotify using the provided session and name.
 *
 * @param {AuthSession} session - The session object containing the user's authentication information.
 * @param {string} name - The name of the playlist to be created.
 * @return {Promise<any>} A promise that resolves to the response from the Spotify API upon successful creation of the playlist.
 */
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
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ name }),
    },
  ).then((res) => res.json());
  return res;
};

/**
 * Adds songs to a Spotify playlist using the provided session and playlist ID.
 *
 * @param {AuthSession} session - The session object containing the user's authentication information.
 * @param {string} playlistId - The ID of the playlist to add songs to.
 * @param {string[]} trackIds - The IDs of the tracks to add.
 * @return {Promise<any[]>} A promise that resolves to an array of responses from the Spotify API upon successful addition of tracks to the playlist.
 */
export const addSongsToPlaylist = async (
  session: AuthSession,
  playlistId: string,
  trackIds: string[],
): Promise<any> => {
  if (!session) {
    return null;
  }

  const addTracks = async (ids: string[]) => {
    const processedTrackIds = ids.map((id) => `spotify:track:${id}`);
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ uris: processedTrackIds }),
      },
    );
    return response.json();
  };

  // Copy before batching - splice would otherwise empty the caller's array.
  const remaining = [...trackIds];
  const batchSize = 100;
  const results: any[] = [];
  while (remaining.length > 0) {
    results.push(await addTracks(remaining.splice(0, batchSize)));
  }

  return results;
};

/**
 * Fetches the top items (artists or tracks) of the user based on the specified time range.
 *
 * @param {Object} options - The options for fetching the top items.
 * @param {AuthSession} options.session - The session object containing the user's authentication information.
 * @param {string} [options.timeRange='short_term'] - The time range for which to fetch the top items.
 * @param {number} [options.limit=50] - The maximum number of top items to fetch.
 * @param {'artists' | 'tracks'} options.type - The type of top items to fetch ('artists' or 'tracks').
 * @return {Promise<any>} A promise that resolves to the top items data from the Spotify API.
 */
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
}): Promise<any> => {
  // Construct the URL for fetching the top items
  const url = `https://api.spotify.com/v1/me/top/${type}?time_range=${timeRange}&limit=${limit}`;

  // Fetch the top items from the Spotify API using the customGet function
  return customGet(url, session);
};

/**
 * Fetches all the user's liked playlists from the Spotify API.
 *
 * @param {AuthSession} session - The session object containing the user's authentication information.
 * @return {Promise<SimplifiedPlaylist[]>} A promise that resolves to an array of simplified playlist objects.
 */
export const getAllUserLikedPlaylists = async (
  session: AuthSession,
): Promise<SimplifiedPlaylist[]> => {
  const items = await collectAllPages(
    session,
    'https://api.spotify.com/v1/me/playlists?limit=50',
  );

  // Spotify occasionally returns null entries for playlists that have become
  // unavailable; they would blow up sorting and rendering downstream.
  return items.filter(Boolean);
};

/**
 * Fetches all of the user's saved ("Liked Songs") tracks from the Spotify API.
 *
 * @param {AuthSession} session - The session object containing the user's authentication information.
 * @return {Promise<SavedTrack[]>} A promise that resolves to an array of the user's saved tracks.
 */
export const getAllUserSavedTracks = async (
  session: AuthSession,
): Promise<SavedTrack[]> => {
  const items = await collectAllPages(
    session,
    'https://api.spotify.com/v1/me/tracks?limit=50',
  );

  return items.filter(Boolean);
};

/**
 * Fetches a track by its ID from the Spotify API.
 *
 * @param {AuthSession} session - The session object containing the user's authentication information.
 * @param {string} trackId - The ID of the track to fetch.
 * @return {Promise<Track>} A promise that resolves to the track object from the Spotify API.
 */
export const getTrackById = async (
  session: AuthSession,
  trackId: string,
): Promise<Track> => {
  // Construct the URL for fetching the track
  const url = `https://api.spotify.com/v1/tracks/${trackId}`;

  // Fetch the track from the Spotify API using the customGet function
  return customGet(url, session);
};

/**
 * Fetches all tracks from a playlist by its link from the Spotify API.
 *
 * @param {AuthSession} session - The session object containing the user's authentication information.
 * @param {string} playlistLink - The link of the playlist to fetch.
 * @return {Promise<PlaylistedTrack[]>} A promise that resolves to an array of track objects from the Spotify API.
 */
export const getTrackFromPlaylistLink = async (
  session: AuthSession,
  playlistLink: string,
): Promise<PlaylistedTrack[]> => {
  // `tracks.href` may already carry a query string, so append rather than assume.
  const separator = playlistLink.includes('?') ? '&' : '?';
  const items = await collectAllPages(
    session,
    `${playlistLink}${separator}limit=100`,
  );

  return items.filter(Boolean);
};

/**
 * Fetches the genres Spotify associates with a set of artists.
 *
 * Genre lives on the artist, not the track — there is no per-track genre in the
 * Spotify API — so grouping results by genre means resolving the artists behind
 * the matched tracks. Batched 50 at a time and fanned out, because this runs
 * against the handful of artists in a result set rather than a whole library.
 *
 * @param {AuthSession} session - The session object containing the user's authentication information.
 * @param {string[]} artistIds - Spotify artist ids.
 * @return {Promise<Record<string, string[]>>} Genres keyed by artist id. Artists
 *   Spotify has no genres for are present with an empty list.
 */
export const getArtistGenres = async (
  session: AuthSession,
  artistIds: string[],
): Promise<Record<string, string[]>> => {
  const unique = [...new Set(artistIds.filter(Boolean))];
  if (unique.length === 0) {
    return {};
  }

  const batches = chunkArray(unique, ARTIST_BATCH_SIZE);
  const responses = await mapWithConcurrency(
    batches,
    PAGE_CONCURRENCY,
    (batch) =>
      customGet(
        `https://api.spotify.com/v1/artists?ids=${batch.join(',')}`,
        session,
      ),
  );

  const genres: Record<string, string[]> = {};
  for (const response of responses) {
    for (const artist of (response?.artists ?? []) as (Artist | null)[]) {
      if (artist?.id) {
        genres[artist.id] = artist.genres ?? [];
      }
    }
  }

  return genres;
};

// NOTE: getTrackAnalysis / getManyTrackAnalysis used to live here, wrapping
// Spotify's /audio-features endpoint. Spotify deprecated that endpoint on
// 2024-11-27 and it now returns 403 for every app without pre-existing extended
// quota access. Tempo lookups moved to ../lib/bpm, which sources BPM from
// ReccoBeats with a Deezer-by-ISRC fallback.
