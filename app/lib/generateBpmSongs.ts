import { AuthSession } from '../types/types';
import { Playlist, Track, TrackWithAudioFeature } from '../types/updatedTypes';
import { TempoAnalysis } from './bpm/types';
import { getTempos } from './bpm';
import {
  getAllUserSavedTracks,
  getTopItems,
  getTrackFromPlaylistLink,
} from './actions';

/** Sentinel id for the synthetic "Liked Songs" source. */
export const LIKED_SONGS_ID = '__liked_songs__';

/** Sentinel ids for the synthetic "Top Tracks" sources. */
export const TOP_TRACKS_IDS = {
  short_term: '__top_short_term__',
  medium_term: '__top_medium_term__',
  long_term: '__top_long_term__',
} as const;

// splits arrays (of tracks) into chunks
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

/**
 * Playlists can contain podcast episodes, local files, and tombstones for
 * tracks that have been pulled from the catalogue. None of those have a tempo
 * we can look up, and the nulls used to crash the scan outright.
 */
function isPlayableTrack(track: unknown): track is Track {
  const candidate = track as Track & { is_local?: boolean; type?: string };
  return (
    !!candidate &&
    typeof candidate.id === 'string' &&
    candidate.id.length > 0 &&
    candidate.type !== 'episode' &&
    !candidate.is_local
  );
}

/**
 * Decides whether a tempo falls inside the user's range, optionally counting
 * songs at double or half the target pace (a 160 BPM song works for a 80 BPM
 * stride).
 *
 * @param {number} tempo - The track's tempo in BPM.
 * @param {number} lowBpm - Bottom of the desired range.
 * @param {number} highBpm - Top of the desired range.
 * @param {boolean} getDoubled - Also accept tracks at twice the target pace.
 * @param {boolean} getHalved - Also accept tracks at half the target pace.
 * @return {boolean} True if the tempo should be kept.
 */
function tempoMatches(
  tempo: number,
  lowBpm: number,
  highBpm: number,
  getDoubled: boolean,
  getHalved: boolean,
): boolean {
  if (tempo >= lowBpm && tempo <= highBpm) {
    return true;
  }
  if (getDoubled && tempo >= lowBpm * 2 && tempo <= highBpm * 2) {
    return true;
  }
  if (getHalved && tempo >= lowBpm / 2 && tempo <= highBpm / 2) {
    return true;
  }
  return false;
}

/**
 * Keeps only the songs whose tempo falls in the desired BPM range.
 *
 * @param {number} lowBpm - Bottom of the desired range.
 * @param {number} highBpm - Top of the desired range.
 * @param {Track[][]} chunkedSongs - Songs to filter, in chunks.
 * @param {AuthSession} session - Unused; kept for call-site compatibility.
 * @param {boolean} getDoubled - Also accept tracks at twice the target pace.
 * @param {boolean} getHalved - Also accept tracks at half the target pace.
 * @return {Promise<TrackWithAudioFeature[]>} The matching tracks, each paired
 *   with the tempo we resolved for it.
 */
async function keepSongsInCorrectBpmRange(
  lowBpm: number,
  highBpm: number,
  chunkedSongs: Track[][],
  session: AuthSession,
  getDoubled = false,
  getHalved = false,
): Promise<TrackWithAudioFeature[]> {
  const songs = chunkedSongs.flat().filter(isPlayableTrack);
  const tempos = await lookupTempos(songs);

  return matchSongsToTempos(
    songs,
    tempos,
    lowBpm,
    highBpm,
    getDoubled,
    getHalved,
  );
}

/**
 * Resolves tempos for a set of tracks, keyed by Spotify track id.
 *
 * @param {Track[]} songs - The tracks to resolve.
 * @return {Promise<Map<string, TempoAnalysis>>} Tempo by Spotify track id.
 */
async function lookupTempos(
  songs: Track[],
): Promise<Map<string, TempoAnalysis>> {
  const analyses = await getTempos(
    songs.map((song) => ({
      id: song.id,
      isrc: song.external_ids?.isrc ?? null,
    })),
  );

  return new Map(analyses.map((analysis) => [analysis.id, analysis]));
}

/**
 * Pairs each in-range song with its tempo.
 *
 * @param {Track[]} songs - Candidate tracks.
 * @param {Map<string, TempoAnalysis>} tempos - Tempo by Spotify track id.
 * @param {number} lowBpm - Bottom of the desired range.
 * @param {number} highBpm - Top of the desired range.
 * @param {boolean} getDoubled - Also accept tracks at twice the target pace.
 * @param {boolean} getHalved - Also accept tracks at half the target pace.
 * @return {TrackWithAudioFeature[]} The matching tracks with their tempo.
 */
function matchSongsToTempos(
  songs: Track[],
  tempos: Map<string, TempoAnalysis>,
  lowBpm: number,
  highBpm: number,
  getDoubled: boolean,
  getHalved: boolean,
): TrackWithAudioFeature[] {
  const results: TrackWithAudioFeature[] = [];

  for (const song of songs) {
    const analysis = tempos.get(song.id);
    if (
      analysis &&
      tempoMatches(analysis.tempo, lowBpm, highBpm, getDoubled, getHalved)
    ) {
      results.push({ ...song, analysis });
    }
  }

  return results;
}

/**
 * Fetches every playable track belonging to one selected source, which may be a
 * real playlist, the user's Liked Songs, or one of the top-tracks ranges.
 *
 * @param {AuthSession} session - The session object containing the user's authentication information.
 * @param {Playlist} playlist - The selected source.
 * @return {Promise<Track[]>} The source's playable tracks, de-duplicated.
 */
async function collectSourceTracks(
  session: AuthSession,
  playlist: Playlist,
): Promise<Track[]> {
  let raw: unknown[];

  if (playlist.id === LIKED_SONGS_ID) {
    const saved = await getAllUserSavedTracks(session);
    raw = saved.map((item) => item.track);
  } else if (playlist.id === TOP_TRACKS_IDS.short_term) {
    raw = (await getTopItems({ session, timeRange: 'short_term', type: 'tracks' }))
      ?.items;
  } else if (playlist.id === TOP_TRACKS_IDS.medium_term) {
    raw = (
      await getTopItems({ session, timeRange: 'medium_term', type: 'tracks' })
    )?.items;
  } else if (playlist.id === TOP_TRACKS_IDS.long_term) {
    raw = (await getTopItems({ session, timeRange: 'long_term', type: 'tracks' }))
      ?.items;
  } else {
    const items = await getTrackFromPlaylistLink(session, playlist.tracks.href);
    raw = items.map((item) => item.track);
  }

  const seen = new Set<string>();
  const tracks: Track[] = [];
  for (const track of raw ?? []) {
    if (isPlayableTrack(track) && !seen.has(track.id)) {
      seen.add(track.id);
      tracks.push(track);
    }
  }

  return tracks;
}

/**
 * Builds a synthetic playlist for one of the non-playlist sources so it can
 * flow through the same selection and result-rendering path as a real one.
 *
 * @param {string} id - Sentinel id for the source.
 * @param {string} name - Display name.
 * @param {string} image - Cover image URL.
 * @return {Playlist} A playlist-shaped object.
 */
function syntheticPlaylist(id: string, name: string, image: string): Playlist {
  return {
    id,
    name,
    images: [{ url: image, height: null, width: null }],
    tracks: { href: '', total: 0 },
  } as unknown as Playlist;
}

/**
 * Scans the selected sources and returns, per source, the songs whose tempo
 * falls in the requested BPM range.
 *
 * Tempos for every selected source are resolved in a single pass so a song that
 * appears in five playlists is only looked up once.
 *
 * @param {number} lowBpm - Bottom of the desired range.
 * @param {number} highBpm - Top of the desired range.
 * @param {boolean} useDoubleSpeed - Also accept tracks at twice the target pace.
 * @param {boolean} useHalfSpeed - Also accept tracks at half the target pace.
 * @param {boolean} useTopShortTerm - Include top tracks from the last 4 weeks.
 * @param {boolean} useTopMediumTerm - Include top tracks from the last 6 months.
 * @param {boolean} useTopLongTerm - Include top tracks from the last year.
 * @param {AuthSession} session - The session object containing the user's authentication information.
 * @param {Playlist[]} [playlists] - The selected playlists.
 * @return {Promise<Map<Playlist, TrackWithAudioFeature[]>>} Matching songs per source.
 */
async function generateBpmSongs(
  lowBpm: number,
  highBpm: number,
  useDoubleSpeed: boolean,
  useHalfSpeed: boolean,
  useTopShortTerm: boolean,
  useTopMediumTerm: boolean,
  useTopLongTerm: boolean,
  session: AuthSession,
  playlists?: Playlist[],
): Promise<Map<Playlist, TrackWithAudioFeature[]>> {
  const sources: Playlist[] = [...(playlists ?? [])];

  if (useTopShortTerm) {
    sources.push(
      syntheticPlaylist(
        TOP_TRACKS_IDS.short_term,
        'Top Tracks (last 4 weeks)',
        '/images/liked_cover.jpeg',
      ),
    );
  }
  if (useTopMediumTerm) {
    sources.push(
      syntheticPlaylist(
        TOP_TRACKS_IDS.medium_term,
        'Top Tracks (last 6 months)',
        '/images/liked_cover.jpeg',
      ),
    );
  }
  if (useTopLongTerm) {
    sources.push(
      syntheticPlaylist(
        TOP_TRACKS_IDS.long_term,
        'Top Tracks (last year)',
        '/images/liked_cover.jpeg',
      ),
    );
  }

  if (sources.length === 0) {
    throw new Error('No playlists or top tracks selected');
  }

  // Gather every source's tracks first, so the tempo lookup can be done once
  // across the whole selection instead of once per playlist.
  const perSource = new Map<Playlist, Track[]>();
  for (const source of sources) {
    perSource.set(source, await collectSourceTracks(session, source));
  }

  const allTracks = new Map<string, Track>();
  for (const tracks of perSource.values()) {
    for (const track of tracks) {
      if (!allTracks.has(track.id)) {
        allTracks.set(track.id, track);
      }
    }
  }

  const tempos = await lookupTempos([...allTracks.values()]);

  const playlistTracks = new Map<Playlist, TrackWithAudioFeature[]>();
  for (const [source, tracks] of perSource) {
    playlistTracks.set(
      source,
      matchSongsToTempos(
        tracks,
        tempos,
        lowBpm,
        highBpm,
        useDoubleSpeed,
        useHalfSpeed,
      ),
    );
  }

  return playlistTracks;
}

export {
  chunkArray,
  isPlayableTrack,
  tempoMatches,
  keepSongsInCorrectBpmRange,
  generateBpmSongs,
};
