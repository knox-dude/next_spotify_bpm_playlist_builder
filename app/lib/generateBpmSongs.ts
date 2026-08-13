import { AuthSession } from '../types/types';
import { Playlist, Track, TrackWithAudioFeature } from '../types/updatedTypes';
import { TempoAnalysis } from './bpm/types';
import { getTempos } from './bpm';
import { chunkArray, mapWithConcurrency } from './concurrency';
import {
  getAllUserSavedTracks,
  getArtistGenres,
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

/**
 * How many sources to pull tracks from at once.
 *
 * Each source is one server action, and each of those pages through Spotify in
 * parallel internally, so this multiplies. Four is enough to hide the latency of
 * a slow playlist without turning a 60-playlist scan into a burst Spotify will
 * rate-limit.
 */
const SOURCE_CONCURRENCY = 4;

/**
 * How many tracks to resolve per call into the tempo provider.
 *
 * getTempos runs server-side, so one call is one serverless invocation. Hosts
 * cap those: Vercel's Hobby tier kills a function at 10s. Resolving a whole
 * library in a single call would blow straight past that, so the work is split
 * into chunks that each finish in a couple of seconds. Measured at ~2.5s for
 * 117 tracks including the Deezer fallback.
 */
const TEMPO_LOOKUP_CHUNK = 120;

/**
 * How many of those chunks to run at once.
 *
 * The chunking exists for the per-invocation time limit, not for politeness, so
 * the chunks have no reason to run one after another — three at a time turns a
 * 3,000-track lookup from about a minute into about twenty seconds. The
 * providers' own concurrency limits are set with this multiplier in mind.
 */
const TEMPO_CHUNK_CONCURRENCY = 3;

/** Progress phases, in the order a scan moves through them. */
export type ScanPhase = 'sources' | 'tempos' | 'genres';

/** A progress report, emitted as each unit of work finishes. */
export interface ScanProgress {
  phase: ScanPhase;
  /** Units finished so far in this phase. */
  done: number;
  /** Units in this phase. */
  total: number;
}

/** What a scan produced. */
export interface ScanResult {
  /** Every matching track, de-duplicated across sources, slowest tempo first. */
  tracks: TrackWithAudioFeature[];
  /** How many distinct tracks were considered. */
  scannedCount: number;
  /** How many sources those tracks came from. */
  sourceCount: number;
}

/** Everything a scan needs. */
export interface GenerateBpmSongsOptions {
  session: AuthSession;
  lowBpm: number;
  highBpm: number;
  /** Also accept tracks at twice the target pace. */
  useDoubleSpeed?: boolean;
  /** Also accept tracks at half the target pace. */
  useHalfSpeed?: boolean;
  /** Include top tracks from the last 4 weeks. */
  useTopShortTerm?: boolean;
  /** Include top tracks from the last 6 months. */
  useTopMediumTerm?: boolean;
  /** Include top tracks from the last year. */
  useTopLongTerm?: boolean;
  /** The selected playlists, including the synthetic Liked Songs entry. */
  playlists?: Playlist[];
  /** Called as work completes, so the UI can show something truthful. */
  onProgress?: (progress: ScanProgress) => void;
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
 * Resolves tempos for a set of tracks, keyed by Spotify track id.
 *
 * @param {Track[]} songs - The tracks to resolve.
 * @param {function} [onProgress] - Called with the number of tracks resolved so far.
 * @return {Promise<Map<string, TempoAnalysis>>} Tempo by Spotify track id.
 */
async function lookupTempos(
  songs: Track[],
  onProgress?: (done: number, total: number) => void,
): Promise<Map<string, TempoAnalysis>> {
  const tempos = new Map<string, TempoAnalysis>();
  const chunks = chunkArray(songs, TEMPO_LOOKUP_CHUNK);
  let finished = 0;

  const chunkResults = await mapWithConcurrency(
    chunks,
    TEMPO_CHUNK_CONCURRENCY,
    async (chunk) => {
      const analyses = await getTempos(
        chunk.map((song) => ({
          id: song.id,
          isrc: song.external_ids?.isrc ?? null,
        })),
      );
      finished += chunk.length;
      onProgress?.(finished, songs.length);
      return analyses;
    },
  );

  for (const analyses of chunkResults) {
    for (const analysis of analyses ?? []) {
      tempos.set(analysis.id, analysis);
    }
  }

  return tempos;
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
 * flow through the same selection path as a real one.
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
 * Attaches each track's primary-artist genres, which is the only genre Spotify
 * exposes — tracks and albums carry none.
 *
 * A failure here is not worth losing a scan over: the results simply group under
 * "No genre" instead.
 *
 * @param {AuthSession} session - The session object containing the user's authentication information.
 * @param {TrackWithAudioFeature[]} tracks - The matched tracks.
 * @return {Promise<TrackWithAudioFeature[]>} The same tracks, with genres filled in.
 */
async function attachGenres(
  session: AuthSession,
  tracks: TrackWithAudioFeature[],
): Promise<TrackWithAudioFeature[]> {
  const artistIds = tracks
    .map((track) => track.artists?.[0]?.id)
    .filter((id): id is string => !!id);

  if (artistIds.length === 0) {
    return tracks;
  }

  try {
    const genresByArtist = await getArtistGenres(session, artistIds);
    return tracks.map((track) => {
      const artistId = track.artists?.[0]?.id;
      return {
        ...track,
        genres: (artistId && genresByArtist[artistId]) || [],
      };
    });
  } catch {
    return tracks;
  }
}

/**
 * Scans the selected sources and returns every song whose tempo falls in the
 * requested BPM range.
 *
 * Sources are pulled in parallel, tempos are resolved in parallel across the
 * whole selection (so a song in five playlists is looked up once), and the
 * result is a single de-duplicated list — which playlist a song arrived from
 * stops mattering the moment it has a tempo.
 *
 * @param {GenerateBpmSongsOptions} options - The scan parameters.
 * @return {Promise<ScanResult>} The matching tracks and what was scanned.
 */
async function generateBpmSongs({
  session,
  lowBpm,
  highBpm,
  useDoubleSpeed = false,
  useHalfSpeed = false,
  useTopShortTerm = false,
  useTopMediumTerm = false,
  useTopLongTerm = false,
  playlists,
  onProgress,
}: GenerateBpmSongsOptions): Promise<ScanResult> {
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

  onProgress?.({ phase: 'sources', done: 0, total: sources.length });

  let sourcesDone = 0;
  const perSource = await mapWithConcurrency(
    sources,
    SOURCE_CONCURRENCY,
    async (source) => {
      const tracks = await collectSourceTracks(session, source);
      sourcesDone += 1;
      onProgress?.({
        phase: 'sources',
        done: sourcesDone,
        total: sources.length,
      });
      return tracks;
    },
  );

  // One song can sit in a dozen playlists; it only needs one tempo lookup.
  const allTracks = new Map<string, Track>();
  for (const tracks of perSource) {
    for (const track of tracks ?? []) {
      if (!allTracks.has(track.id)) {
        allTracks.set(track.id, track);
      }
    }
  }

  const candidates = [...allTracks.values()];
  onProgress?.({ phase: 'tempos', done: 0, total: candidates.length });

  const tempos = await lookupTempos(candidates, (done, total) =>
    onProgress?.({ phase: 'tempos', done, total }),
  );

  const matches = matchSongsToTempos(
    candidates,
    tempos,
    lowBpm,
    highBpm,
    useDoubleSpeed,
    useHalfSpeed,
  );

  onProgress?.({ phase: 'genres', done: 0, total: matches.length });
  const withGenres = await attachGenres(session, matches);
  onProgress?.({ phase: 'genres', done: matches.length, total: matches.length });

  return {
    tracks: withGenres.sort((a, b) => a.analysis.tempo - b.analysis.tempo),
    scannedCount: candidates.length,
    sourceCount: sources.length,
  };
}

export {
  chunkArray,
  isPlayableTrack,
  tempoMatches,
  matchSongsToTempos,
  generateBpmSongs,
};
