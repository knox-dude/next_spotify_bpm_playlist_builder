import { fetchWithRateLimitRetry } from './http';
import { TempoAnalysis } from './types';

const ENDPOINT = 'https://api.deezer.com/2.0/track/isrc:';

/**
 * Deezer quotas are roughly 50 requests per 5 seconds per IP, and a scan now
 * runs several lookup calls at once (see TEMPO_CHUNK_CONCURRENCY), so the
 * per-call figure is deliberately small: it multiplies. Anything that still
 * slips past the quota comes back as a 429 and is retried.
 */
export const DEEZER_CONCURRENCY = 2;

/**
 * Looks a tempo up by ISRC, the recording identifier Spotify exposes as
 * `external_ids.isrc`.
 *
 * This is the fallback for tracks ReccoBeats has never seen. It matches on the
 * *recording* rather than on a particular Spotify release, which is what lets
 * it find remasters and regional re-releases that ReccoBeats misses.
 *
 * @param spotifyId The Spotify track id the result should be keyed under.
 * @param isrc The recording's ISRC.
 * @param signal Optional abort signal.
 * @return The tempo analysis, or null if Deezer has no BPM for the recording.
 */
export async function fetchTempoByIsrc(
  spotifyId: string,
  isrc: string,
  signal?: AbortSignal,
): Promise<TempoAnalysis | null> {
  const res = await fetchWithRateLimitRetry(
    `${ENDPOINT}${encodeURIComponent(isrc)}`,
    {
      headers: { Accept: 'application/json' },
      signal,
    },
  );

  if (!res.ok) {
    return null;
  }

  // Deezer answers unknown ISRCs with 200 and an `error` object in the body.
  const body = (await res.json()) as { bpm?: number; error?: unknown };
  if (body.error || !body.bpm) {
    return null;
  }

  return { id: spotifyId, tempo: body.bpm, source: 'deezer' };
}
