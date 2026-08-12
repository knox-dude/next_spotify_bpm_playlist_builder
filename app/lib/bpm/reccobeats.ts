import { TempoAnalysis } from './types';

const ENDPOINT = 'https://api.reccobeats.com/v1/audio-features';

/**
 * ReccoBeats rejects anything larger with
 * `{"status":4004,"errors":[{"message":"size must be between 1 and 40"}]}`.
 * (Spotify's old endpoint allowed 100, hence the smaller batches here.)
 */
export const RECCOBEATS_BATCH_SIZE = 40;

/**
 * ReccoBeats keys its responses on its *own* UUID, not the Spotify id we asked
 * for. The only link back to our request is the `href` field, which looks like
 * `https://open.spotify.com/track/<spotifyId>`, so we parse the id out of it.
 */
const SPOTIFY_TRACK_HREF = /\/track\/([A-Za-z0-9]+)/;

interface ReccoBeatsItem {
  href?: string | null;
  tempo?: number | null;
}

/**
 * Looks up tempos for a batch of Spotify track ids.
 *
 * Tracks ReccoBeats doesn't know about are silently omitted from its response
 * rather than returned as nulls, so the returned map is expected to be smaller
 * than `ids`.
 *
 * @param ids Spotify track ids, at most {@link RECCOBEATS_BATCH_SIZE} of them.
 * @param signal Optional abort signal.
 * @return Map of Spotify track id to tempo analysis.
 */
export async function fetchTempoBatch(
  ids: string[],
  signal?: AbortSignal,
): Promise<Map<string, TempoAnalysis>> {
  const results = new Map<string, TempoAnalysis>();
  if (ids.length === 0) {
    return results;
  }
  if (ids.length > RECCOBEATS_BATCH_SIZE) {
    throw new Error(
      `ReccoBeats accepts at most ${RECCOBEATS_BATCH_SIZE} ids per request, got ${ids.length}`,
    );
  }

  const res = await fetch(`${ENDPOINT}?ids=${ids.join(',')}`, {
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!res.ok) {
    throw new Error(`ReccoBeats responded ${res.status} ${res.statusText}`);
  }

  const body = (await res.json()) as { content?: ReccoBeatsItem[] };

  for (const item of body.content ?? []) {
    const spotifyId = item.href?.match(SPOTIFY_TRACK_HREF)?.[1];
    // A tempo of 0 means "unknown" just as surely as a missing one does.
    if (spotifyId && item.tempo) {
      results.set(spotifyId, {
        id: spotifyId,
        tempo: item.tempo,
        source: 'reccobeats',
      });
    }
  }

  return results;
}
