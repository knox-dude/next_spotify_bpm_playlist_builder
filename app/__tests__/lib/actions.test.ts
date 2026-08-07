import {
  createPlaylist,
  addSongsToPlaylist,
  getTopItems,
  getAllUserLikedPlaylists,
  getTrackById,
  getTrackFromPlaylistLink,
  getAllUserSavedTracks,
} from '../../lib/actions';
import {
  Track,
  PlaylistedTrack,
  SimplifiedPlaylist,
} from '../../types/updatedTypes';
import { AuthSession } from '../../types/types';
import fetch from 'jest-fetch-mock';

// get this from other tests
const mockSession: AuthSession = {
  user: {
    sub: '123',
    accessToken: 'mockAccessToken',
  },
} as AuthSession;

afterEach(() => {
  fetch.resetMocks();
});

describe('Spotify API functions', () => {
  test('createPlaylist returns response on success', async () => {
    fetch.mockResponse(
      JSON.stringify({
        collaborative: false,
        description: 'string',
        external_urls: {
          spotify: 'string',
        },
        followers: {
          href: 'string',
          total: 0,
        },
        href: 'string',
        id: 'string',
        images: [
          {
            url: 'https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228',
            height: 300,
            width: 300,
          },
        ],
        name: 'Test Playlist',
        owner: {
          external_urls: {
            spotify: 'string',
          },
          followers: {
            href: 'string',
            total: 0,
          },
          href: 'string',
          id: 'string',
          type: 'user',
          uri: 'string',
          display_name: 'string',
        },
        public: false,
        snapshot_id: 'string',
        tracks: {
          href: 'https://api.spotify.com/v1/me/shows?offset=0&limit=20',
          limit: 20,
          next: 'https://api.spotify.com/v1/me/shows?offset=1&limit=1',
          offset: 0,
          previous: 'https://api.spotify.com/v1/me/shows?offset=1&limit=1',
          total: 4,
          items: [
            {
              added_at: 'string',
              added_by: {
                external_urls: {
                  spotify: 'string',
                },
                followers: {
                  href: 'string',
                  total: 0,
                },
                href: 'string',
                id: 'string',
                type: 'user',
                uri: 'string',
              },
              is_local: false,
              track: {
                album: {
                  album_type: 'compilation',
                  total_tracks: 9,
                  available_markets: ['CA', 'BR', 'IT'],
                  external_urls: {
                    spotify: 'string',
                  },
                  href: 'string',
                  id: '2up3OPMp9Tb4dAKM2erWXQ',
                  images: [
                    {
                      url: 'https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228',
                      height: 300,
                      width: 300,
                    },
                  ],
                  name: 'string',
                  release_date: '1981-12',
                  release_date_precision: 'year',
                  restrictions: {
                    reason: 'market',
                  },
                  type: 'album',
                  uri: 'spotify:album:2up3OPMp9Tb4dAKM2erWXQ',
                  artists: [
                    {
                      external_urls: {
                        spotify: 'string',
                      },
                      href: 'string',
                      id: 'string',
                      name: 'string',
                      type: 'artist',
                      uri: 'string',
                    },
                  ],
                },
                artists: [
                  {
                    external_urls: {
                      spotify: 'string',
                    },
                    href: 'string',
                    id: 'string',
                    name: 'string',
                    type: 'artist',
                    uri: 'string',
                  },
                ],
                available_markets: ['string'],
                disc_number: 0,
                duration_ms: 0,
                explicit: false,
                external_ids: {
                  isrc: 'string',
                  ean: 'string',
                  upc: 'string',
                },
                external_urls: {
                  spotify: 'string',
                },
                href: 'string',
                id: 'string',
                is_playable: false,
                linked_from: {},
                restrictions: {
                  reason: 'string',
                },
                name: 'string',
                popularity: 0,
                preview_url: 'string',
                track_number: 0,
                type: 'track',
                uri: 'string',
                is_local: false,
              },
            },
          ],
        },
        type: 'string',
        uri: 'string',
      }),
    );

    const response = await createPlaylist(mockSession, 'Test Playlist');
    expect(response).toMatchObject({ id: 'string', name: 'Test Playlist' });
  });

  test('createPlaylist returns null if no session', async () => {
    const response = await createPlaylist(
      null as unknown as AuthSession,
      'Test Playlist',
    );
    expect(response).toBeNull();
  });

  test('addSongsToPlaylist adds songs in batches of 100', async () => {
    const trackIds = Array.from({ length: 150 }, (_, i) => `track${i}`);

    fetch.mockResponse(
      JSON.stringify({
        snapshot_id: 'snapshot_id',
      }),
    );

    const response = (await addSongsToPlaylist(
      mockSession,
      'test_playlist',
      trackIds,
    )) as Response[];
    expect(response).toHaveLength(2);
    response.forEach((res: Response) =>
      expect(res).toEqual({ snapshot_id: 'snapshot_id' }),
    );
  });

  test('addSongsToPlaylist returns null if no session', async () => {
    const response = await addSongsToPlaylist(
      null as unknown as AuthSession,
      'test_playlist',
      ['track1'],
    );
    expect(response).toBeNull();
  });

  test('getTopItems fetches top items based on type', async () => {
    const mockTopTracks = { items: [{ id: 'track1' }] };

    fetch.mockResponse(JSON.stringify(mockTopTracks));

    const response = await getTopItems({
      session: mockSession,
      type: 'tracks',
    });
    expect(response).toEqual(mockTopTracks);
  });

  test('getAllUserLikedPlaylists fetches all user liked playlists', async () => {
    const mockPlaylists = {
      items: [{ id: 'playlist1' }],
      next: null,
    };

    fetch.mockResponse(JSON.stringify(mockPlaylists));

    const response = await getAllUserLikedPlaylists(mockSession);
    expect(response).toEqual(mockPlaylists.items);
  });

  test('getTrackById fetches track by id', async () => {
    const mockTrack: Track = { id: 'track1', name: 'Track 1' } as Track;

    fetch.mockResponse(JSON.stringify(mockTrack));

    const response = await getTrackById(mockSession, 'track1');
    expect(response).toEqual(mockTrack);
  });

  test('getTrackFromPlaylistLink fetches tracks from playlist link', async () => {
    const mockTracks: PlaylistedTrack[] = [
      { track: { id: 'track1', name: 'Track 1' } } as PlaylistedTrack,
    ];
    const mockData = { items: mockTracks, next: null };

    fetch.mockResponse(JSON.stringify(mockData));

    const response = await getTrackFromPlaylistLink(
      mockSession,
      'https://api.spotify.com/v1/playlists/test_playlist/tracks',
    );
    expect(response).toEqual(mockTracks);
  });

  // getTrackAnalysis / getManyTrackAnalysis were removed along with Spotify's
  // deprecated /audio-features endpoint. Tempo lookups are covered by
  // __tests__/lib/bpm.test.ts instead.

  test('getAllUserSavedTracks pages through the user library', async () => {
    const firstPage = {
      items: [{ added_at: '2024-01-01', track: { id: 'track1' } }],
      next: 'https://api.spotify.com/v1/me/tracks?offset=50&limit=50',
    };
    const secondPage = {
      items: [{ added_at: '2024-01-02', track: { id: 'track2' } }],
      next: null,
    };

    fetch.mockResponses(
      [JSON.stringify(firstPage), { status: 200 }],
      [JSON.stringify(secondPage), { status: 200 }],
    );

    const response = await getAllUserSavedTracks(mockSession);
    expect(response).toHaveLength(2);
    expect(response.map((item) => item.track.id)).toEqual(['track1', 'track2']);
  });

  test('addSongsToPlaylist does not mutate the caller array', async () => {
    fetch.mockResponse(JSON.stringify({ snapshot_id: 'abc' }));

    const trackIds = ['track1', 'track2', 'track3'];
    await addSongsToPlaylist(mockSession, 'playlist1', trackIds);

    expect(trackIds).toEqual(['track1', 'track2', 'track3']);
  });
});
