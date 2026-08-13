import { TrackWithAudioFeature } from '../types/updatedTypes';

/**
 * How the results screen buckets matches.
 *
 * Deliberately *not* by playlist: once a song has a tempo, which of your
 * playlists it happened to sit in tells you nothing about whether you want it in
 * the new one.
 */
export type GroupBy = 'artist' | 'album' | 'genre' | 'tempo';

/** How the buckets are ordered. */
export type SortBy = 'size' | 'name' | 'tempo';

export interface TrackGroup {
  /** Stable key for React and for selection. */
  id: string;
  /** What the group is called. */
  label: string;
  /** Secondary line - artist for an album, track count elsewhere. */
  sublabel?: string;
  /** Cover art, borrowed from a track in the group. */
  image?: string;
  tracks: TrackWithAudioFeature[];
}

export const GROUP_BY_LABELS: Record<GroupBy, string> = {
  artist: 'Artist',
  album: 'Album',
  genre: 'Genre',
  tempo: 'Tempo',
};

export const SORT_BY_LABELS: Record<SortBy, string> = {
  size: 'Most songs',
  name: 'A-Z',
  tempo: 'Slowest first',
};

/** Width of a tempo bucket, in BPM. */
const TEMPO_BUCKET = 10;

/** Bucket for tracks whose artist Spotify has no genre for. */
const NO_GENRE = 'No genre';

const albumImage = (track: TrackWithAudioFeature): string | undefined =>
  track.album?.images?.[0]?.url;

/** Spotify returns genres lowercased ("indie rock"); titles read better. */
const titleCase = (value: string): string =>
  value.replace(/(^|\s|-)([a-z])/g, (match) => match.toUpperCase());

/**
 * Picks the bucket a track belongs to.
 *
 * @param {TrackWithAudioFeature} track - The track to place.
 * @param {GroupBy} groupBy - Which facet to bucket on.
 * @return {{ id: string; label: string; sublabel?: string }} The bucket's identity.
 */
function bucketFor(
  track: TrackWithAudioFeature,
  groupBy: GroupBy,
): { id: string; label: string; sublabel?: string } {
  switch (groupBy) {
    case 'album': {
      const album = track.album;
      return {
        id: album?.id ?? `album:${album?.name ?? 'unknown'}`,
        label: album?.name ?? 'Unknown album',
        sublabel: album?.artists?.map((artist) => artist.name).join(', '),
      };
    }
    case 'genre': {
      // Spotify lists an artist's genres roughly most-representative first, so
      // the first one is the closest thing to a primary genre on offer.
      const genre = track.genres?.[0];
      return {
        id: genre ? `genre:${genre}` : 'genre:none',
        label: genre ? titleCase(genre) : NO_GENRE,
      };
    }
    case 'tempo': {
      const floor =
        Math.floor(track.analysis.tempo / TEMPO_BUCKET) * TEMPO_BUCKET;
      return {
        id: `tempo:${floor}`,
        label: `${floor}-${floor + TEMPO_BUCKET - 1} BPM`,
      };
    }
    case 'artist':
    default: {
      const artist = track.artists?.[0];
      return {
        id: artist?.id ?? `artist:${artist?.name ?? 'unknown'}`,
        label: artist?.name ?? 'Unknown artist',
      };
    }
  }
}

/** Mean tempo of a group, used for tempo ordering. */
function averageTempo(tracks: TrackWithAudioFeature[]): number {
  if (tracks.length === 0) {
    return 0;
  }
  const total = tracks.reduce((sum, track) => sum + track.analysis.tempo, 0);
  return total / tracks.length;
}

/**
 * Buckets matched tracks for display.
 *
 * @param {TrackWithAudioFeature[]} tracks - The matched tracks.
 * @param {GroupBy} groupBy - Which facet to bucket on.
 * @param {SortBy} sortBy - How to order the buckets.
 * @return {TrackGroup[]} Ordered groups, each with its tracks slowest first.
 */
export function groupTracks(
  tracks: TrackWithAudioFeature[],
  groupBy: GroupBy,
  sortBy: SortBy = 'size',
): TrackGroup[] {
  const groups = new Map<string, TrackGroup>();

  for (const track of tracks) {
    const bucket = bucketFor(track, groupBy);
    const existing = groups.get(bucket.id);
    if (existing) {
      existing.tracks.push(track);
      existing.image = existing.image ?? albumImage(track);
    } else {
      groups.set(bucket.id, {
        ...bucket,
        image: albumImage(track),
        tracks: [track],
      });
    }
  }

  const ordered = [...groups.values()];

  for (const group of ordered) {
    group.tracks.sort(
      (a, b) =>
        a.analysis.tempo - b.analysis.tempo || a.name.localeCompare(b.name),
    );
    if (groupBy !== 'album') {
      group.sublabel = `${group.tracks.length} song${
        group.tracks.length === 1 ? '' : 's'
      }`;
    }
  }

  ordered.sort((a, b) => {
    // Tracks with no genre are a leftovers bin, not a genre; they go last
    // whatever the sort.
    if (a.label === NO_GENRE) return 1;
    if (b.label === NO_GENRE) return -1;

    switch (sortBy) {
      case 'name':
        return a.label.localeCompare(b.label);
      case 'tempo':
        return averageTempo(a.tracks) - averageTempo(b.tracks);
      case 'size':
      default:
        return (
          b.tracks.length - a.tracks.length || a.label.localeCompare(b.label)
        );
    }
  });

  return ordered;
}
