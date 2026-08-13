'use server';

import { chunkArray, mapWithConcurrency } from '../concurrency';
import { DEEZER_CONCURRENCY, fetchTempoByIsrc } from './deezer';
import { RECCOBEATS_BATCH_SIZE, fetchTempoBatch } from './reccobeats';
import { TempoAnalysis, TempoLookupTrack } from './types';

/**
 * ReccoBeats is a small free service, so we stay well-mannered: a handful of
 * batches at a time rather than one request per 40 tracks all at once. The
 * caller runs several of these lookups at once, so the real ceiling is this
 * times TEMPO_CHUNK_CONCURRENCY.
 */
const RECCOBEATS_CONCURRENCY = 3;

/**
 * Tempos are a property of a recording, not of a user, so they are cached
 * process-wide and shared across every request this server instance handles.
 * On serverless this is a per-instance warm cache, which is exactly the case
 * that matters: scanning many playlists that overlap heavily.
 */
const tempoCache = new Map<string, TempoAnalysis | null>();

/** Keeps the cache from growing without bound on a long-lived server. */
const MAX_CACHE_ENTRIES = 50_000;

function readCache(id: string) {
  return tempoCache.get(id);
}

function writeCache(id: string, value: TempoAnalysis | null) {
  if (tempoCache.size >= MAX_CACHE_ENTRIES) {
    tempoCache.clear();
  }
  tempoCache.set(id, value);
}

/**
 * Resolves tempos for a set of Spotify tracks.
 *
 * Spotify's own `/audio-features` endpoint was deprecated on 2024-11-27 and
 * returns 403, so tempos are gathered from third parties in two passes:
 *
 *   1. ReccoBeats, keyed directly on Spotify track ids (~79% hit rate).
 *   2. Deezer, keyed on ISRC, for whatever pass 1 missed (~+4pp).
 *
 * Anything still unresolved simply has no tempo and is dropped by the caller.
 *
 * @param tracks Tracks to resolve, each with an id and optionally an ISRC.
 * @return Tempo analyses for the tracks that could be resolved. Tracks with no
 *   known tempo are omitted, so this may be shorter than `tracks`.
 */
export async function getTempos(
  tracks: TempoLookupTrack[],
): Promise<TempoAnalysis[]> {
  // Collapse duplicates up front - the same song often appears in many playlists.
  const wanted = new Map<string, TempoLookupTrack>();
  for (const track of tracks) {
    if (track?.id && !wanted.has(track.id)) {
      wanted.set(track.id, track);
    }
  }

  const resolved: TempoAnalysis[] = [];
  const unresolved: TempoLookupTrack[] = [];

  for (const [id, track] of wanted) {
    const cached = readCache(id);
    if (cached === undefined) {
      unresolved.push(track);
    } else if (cached !== null) {
      resolved.push(cached);
    }
    // A cached `null` is a known miss; don't ask again.
  }

  // Pass 1: ReccoBeats, by Spotify id.
  const batches = chunkArray(
    unresolved.map((track) => track.id),
    RECCOBEATS_BATCH_SIZE,
  );
  const batchResults = await mapWithConcurrency(
    batches,
    RECCOBEATS_CONCURRENCY,
    (batch) => fetchTempoBatch(batch),
  );

  const stillMissing: TempoLookupTrack[] = [];
  const found = new Map<string, TempoAnalysis>();
  for (const batch of batchResults) {
    if (batch) {
      for (const [id, analysis] of batch) {
        found.set(id, analysis);
      }
    }
  }

  for (const track of unresolved) {
    const hit = found.get(track.id);
    if (hit) {
      resolved.push(hit);
      writeCache(track.id, hit);
    } else {
      stillMissing.push(track);
    }
  }

  // Pass 2: Deezer, by ISRC. Only worth trying where Spotify gave us one.
  const withIsrc = stillMissing.filter((track) => !!track.isrc);
  const fallbackResults = await mapWithConcurrency(
    withIsrc,
    DEEZER_CONCURRENCY,
    (track) => fetchTempoByIsrc(track.id, track.isrc as string),
  );

  fallbackResults.forEach((analysis, index) => {
    const track = withIsrc[index];
    if (analysis) {
      resolved.push(analysis);
    }
    writeCache(track.id, analysis ?? null);
  });

  // Tracks with no ISRC never had a second chance; record the miss.
  for (const track of stillMissing) {
    if (!track.isrc) {
      writeCache(track.id, null);
    }
  }

  return resolved;
}
