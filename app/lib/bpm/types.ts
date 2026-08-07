/**
 * Where a tempo value came from. Spotify's own /audio-features endpoint was
 * deprecated on 2024-11-27 and now returns 403 for this app, so every tempo
 * is sourced from a third party.
 */
export type TempoSource = 'reccobeats' | 'deezer';

export interface TempoAnalysis {
  /** Spotify track id this tempo belongs to. */
  id: string;
  /** Beats per minute. */
  tempo: number;
  /** Which provider supplied the value. */
  source: TempoSource;
}

/** A tempo lookup keyed by Spotify track id. */
export type TempoMap = Map<string, TempoAnalysis>;

/** The minimum a track needs before we can look its tempo up. */
export interface TempoLookupTrack {
  id: string;
  /** From Spotify's `external_ids.isrc`; enables the Deezer fallback. */
  isrc?: string | null;
}
