// Disclaimer: Code partially taken from Next-Spotify-V2 (https://github.com/ankitk26/Next-Spotify-v2)

import { AuthSession } from '../types/types';
import {
  PlaylistedTrack,
  Track,
  AudioFeatures,
  SimplifiedPlaylist,
} from '../types/updatedTypes';
import { customGet } from '../utils/serverUtils';

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
        },
        method: 'POST',
        body: JSON.stringify({ uris: processedTrackIds }),
      },
    );
    return response.json();
  };

  const batchSize = 100;
  const results: any[] = [];
  while (trackIds.length > 0) {
    const batch = trackIds.splice(0, batchSize);
    results.push(await addTracks(batch));
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
  // Initial request to fetch the first 50 playlists
  let data = await customGet(
    'https://api.spotify.com/v1/me/playlists?limit=50',
    session,
  );

  // Keep fetching playlists until there are no more
  let limit = 50;
  let currUrl = data.next;
  while (currUrl !== null) {
    // Fetch the next batch of playlists
    const nextData = await customGet(currUrl, session);
    // Append the new playlists to the existing data
    data.items.push(...nextData.items);
    // Increase the limit for the next request
    limit += 50;
    // Update the current URL for the next request
    currUrl = nextData.next;
  }

  // Return the fetched playlists
  return data.items;
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
  // Fetch the first batch of tracks from the playlist
  const data = await customGet(`${playlistLink}?limit=100`, session);

  // Keep fetching tracks until there are no more
  let limit = 100;
  let currUrl = data.next;
  while (currUrl !== null) {
    // Fetch the next batch of tracks
    const nextData = await customGet(currUrl, session);
    // Append the new tracks to the existing data
    data.items.push(...nextData.items);
    // Increase the limit for the next request
    limit += 100;
    // Update the current URL for the next request
    currUrl = nextData.next;
  }

  // Return the fetched tracks
  return data.items;
};

/**
 * Fetches the audio features of a track by its ID from the Spotify API.
 *
 * @param {AuthSession} session - The session object containing the user's authentication information.
 * @param {string} trackId - The ID of the track to fetch.
 * @return {Promise<AudioFeatures>} A promise that resolves to the audio features object from the Spotify API.
 */
export const getTrackAnalysis = async (
  session: AuthSession,
  trackId: string,
): Promise<AudioFeatures> => {
  // Construct the URL for fetching the track's audio features
  const url = `https://api.spotify.com/v1/audio-features/${trackId}`;

  // Fetch the track's audio features from the Spotify API using the customGet function
  return customGet(url, session);
};

/**
 * Fetches the audio features of multiple tracks by their IDs from the Spotify API.
 *
 * @param {AuthSession} session - The session object containing the user's authentication information.
 * @param {string[]} trackIds - An array of track IDs to fetch.
 * @return {Promise<AudioFeatures[]>} A promise that resolves to an array of audio features objects from the Spotify API.
 */
export const getManyTrackAnalysis = async (
  session: AuthSession,
  trackIds: string[],
): Promise<AudioFeatures[]> => {
  // Join the track IDs into a comma-separated string
  const joinedIds = trackIds.join(',');

  // Construct the URL for fetching the audio features of the tracks
  const url = `https://api.spotify.com/v1/audio-features?ids=${joinedIds}`;

  // Fetch the audio features of the tracks from the Spotify API using the customGet function
  // and return the audio_features property of the response data
  return customGet(url, session).then((data) => data.audio_features);
};
