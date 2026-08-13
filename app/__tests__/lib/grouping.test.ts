import { groupTracks } from '../../lib/grouping';
import { TrackWithAudioFeature } from '../../types/updatedTypes';

/** Builds a match with just the fields grouping cares about. */
const track = ({
  id,
  name = `Song ${id}`,
  tempo,
  artist = { id: 'artist1', name: 'Artist One' },
  album = { id: 'album1', name: 'Album One' },
  genres,
}: {
  id: string;
  name?: string;
  tempo: number;
  artist?: { id: string; name: string };
  album?: { id: string; name: string };
  genres?: string[];
}) =>
  ({
    id,
    name,
    artists: [artist],
    album: { ...album, artists: [artist], images: [{ url: 'cover.jpg' }] },
    analysis: { id, tempo, source: 'reccobeats' },
    genres,
  }) as unknown as TrackWithAudioFeature;

describe('groupTracks', () => {
  it('buckets by primary artist', () => {
    const groups = groupTracks(
      [
        track({ id: '1', tempo: 120 }),
        track({ id: '2', tempo: 130 }),
        track({
          id: '3',
          tempo: 125,
          artist: { id: 'artist2', name: 'Artist Two' },
        }),
      ],
      'artist',
    );

    expect(groups.map((group) => group.label)).toEqual([
      'Artist One',
      'Artist Two',
    ]);
    expect(groups[0].tracks).toHaveLength(2);
    expect(groups[0].sublabel).toBe('2 songs');
    expect(groups[1].sublabel).toBe('1 song');
  });

  it('buckets by album and credits the album artist', () => {
    const groups = groupTracks(
      [
        track({ id: '1', tempo: 120 }),
        track({
          id: '2',
          tempo: 130,
          album: { id: 'album2', name: 'Album Two' },
        }),
      ],
      'album',
    );

    expect(groups.map((group) => group.label).sort()).toEqual([
      'Album One',
      'Album Two',
    ]);
    expect(groups[0].sublabel).toBe('Artist One');
  });

  it('buckets by the primary artist genre and title-cases it', () => {
    const groups = groupTracks(
      [
        track({ id: '1', tempo: 120, genres: ['indie rock', 'rock'] }),
        track({ id: '2', tempo: 130, genres: ['indie rock'] }),
      ],
      'genre',
    );

    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe('Indie Rock');
  });

  it('drops tracks with no known genre into a bucket that sorts last', () => {
    const groups = groupTracks(
      [
        track({ id: '1', tempo: 120 }),
        track({ id: '2', tempo: 130 }),
        track({ id: '3', tempo: 140, genres: ['house'] }),
      ],
      'genre',
      'size',
    );

    // "No genre" has more songs, but a leftovers bin still belongs at the end.
    expect(groups.map((group) => group.label)).toEqual(['House', 'No genre']);
  });

  it('buckets by 10 BPM bands', () => {
    const groups = groupTracks(
      [
        track({ id: '1', tempo: 121.4 }),
        track({ id: '2', tempo: 129.9 }),
        track({ id: '3', tempo: 130.2 }),
      ],
      'tempo',
      'name',
    );

    expect(groups.map((group) => group.label)).toEqual([
      '120-129 BPM',
      '130-139 BPM',
    ]);
    expect(groups[0].tracks).toHaveLength(2);
  });

  it('orders groups by the requested sort', () => {
    const tracks = [
      track({ id: '1', tempo: 100, artist: { id: 'z', name: 'Zebra' } }),
      track({ id: '2', tempo: 105, artist: { id: 'z', name: 'Zebra' } }),
      track({ id: '3', tempo: 180, artist: { id: 'a', name: 'Aardvark' } }),
    ];

    expect(groupTracks(tracks, 'artist', 'size').map((g) => g.label)).toEqual([
      'Zebra',
      'Aardvark',
    ]);
    expect(groupTracks(tracks, 'artist', 'name').map((g) => g.label)).toEqual([
      'Aardvark',
      'Zebra',
    ]);
    expect(groupTracks(tracks, 'artist', 'tempo').map((g) => g.label)).toEqual([
      'Zebra',
      'Aardvark',
    ]);
  });

  it('sorts songs inside a group slowest first', () => {
    const groups = groupTracks(
      [
        track({ id: '1', tempo: 150 }),
        track({ id: '2', tempo: 110 }),
        track({ id: '3', tempo: 130 }),
      ],
      'artist',
    );

    expect(groups[0].tracks.map((t) => t.analysis.tempo)).toEqual([
      110, 130, 150,
    ]);
  });
});
