import {
  chunkArray,
  keepSongsInCorrectBpmRange,
  generateBpmSongs,
} from './generateBpmSongs';
import { AuthSession } from '../types/types';
import {
  Track,
  AudioFeaturesCollection,
  Playlist,
} from '../types/updatedTypes';
import {
  getManyTrackAnalysis,
  getTrackFromPlaylistLink,
  getTopItems,
} from './actions';

jest.mock('./actions', () => ({
  getManyTrackAnalysis: jest.fn(),
  getTrackFromPlaylistLink: jest.fn(),
  getTopItems: jest.fn(),
}));

describe('chunkArray', () => {
  it('should split array into chunks', () => {
    const array = [1, 2, 3, 4, 5];
    const chunkSize = 2;
    const expected = [[1, 2], [3, 4], [5]];

    expect(chunkArray(array, chunkSize)).toEqual(expected);
  });

  it('should handle empty array', () => {
    const array: number[] = [];
    const chunkSize = 2;
    const expected: number[][] = [];

    expect(chunkArray(array, chunkSize)).toEqual(expected);
  });
});

describe('keepSongsInCorrectBpmRange', () => {
  const now = new Date();
  const hourFromNow = now.getTime() + 60 * 60 * 1000;
  const mockSession: AuthSession = {
    user: {
      name: 'Test User',
      email: 'test@gmail.com',
      accessToken: 'fake-access-token',
      sub: 'test-user',
      expires_at: hourFromNow,
    },
    expires: now.toISOString(),
  };
  const mockTracks: Track[] = [
    {
      id: '1',
      name: 'Track 1',
      album: {},
    },
    { id: '2', name: 'Track 2' },
  ];
  const chunkedSongs: Track[][] = [[mockTracks[0]], [mockTracks[1]]];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should filter songs within the BPM range', async () => {
    const mockAnalysis = [
      { id: '1', tempo: 110 },
      { id: '2', tempo: 90 },
    ];
    (getManyTrackAnalysis as jest.Mock).mockResolvedValue(mockAnalysis);

    const result = await keepSongsInCorrectBpmRange(
      100,
      120,
      chunkedSongs,
      mockSession,
      false,
      false,
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('should handle double speed songs', async () => {
    const mockAnalysis = [
      { id: '1', tempo: 220 },
      { id: '2', tempo: 180 },
    ];
    (getManyTrackAnalysis as jest.Mock).mockResolvedValue(mockAnalysis);

    const result = await keepSongsInCorrectBpmRange(
      100,
      120,
      chunkedSongs,
      mockSession,
      true,
      false,
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('should handle half speed songs', async () => {
    const mockAnalysis = [
      { id: '1', tempo: 55 },
      { id: '2', tempo: 45 },
    ];
    (getManyTrackAnalysis as jest.Mock).mockResolvedValue(mockAnalysis);

    const result = await keepSongsInCorrectBpmRange(
      100,
      120,
      chunkedSongs,
      mockSession,
      false,
      true,
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('should handle empty analysis', async () => {
    (getManyTrackAnalysis as jest.Mock).mockResolvedValue([]);

    const result = await keepSongsInCorrectBpmRange(
      100,
      120,
      chunkedSongs,
      mockSession,
      false,
      false,
    );

    expect(result).toHaveLength(0);
  });
});

describe('generateBpmSongs', () => {
  const mockSession: AuthSession = {
    /* mock session data */
  };
  const mockPlaylist: Playlist = {
    /* mock playlist data */
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if no playlists or top tracks are selected', async () => {
    await expect(
      generateBpmSongs(
        100,
        120,
        false,
        false,
        false,
        false,
        false,
        mockSession,
      ),
    ).rejects.toThrow('No playlists or top tracks selected');
  });

  it('should filter songs within the BPM range', async () => {
    const mockTracks = [
      /* mock track data */
    ];
    (getTrackFromPlaylistLink as jest.Mock).mockResolvedValue(mockTracks);
    (getManyTrackAnalysis as jest.Mock).mockResolvedValue([
      /* mock analysis data */
    ]);

    const result = await generateBpmSongs(
      100,
      120,
      false,
      false,
      false,
      false,
      false,
      mockSession,
      [mockPlaylist],
    );

    expect(result.get(mockPlaylist)?.length).toBeGreaterThan(0);
    // add more assertions as needed
  });

  it('should handle top short term tracks', async () => {
    (getTopItems as jest.Mock).mockResolvedValue([
      /* mock top items data */
    ]);

    await generateBpmSongs(
      100,
      120,
      false,
      false,
      true,
      false,
      false,
      mockSession,
    );

    expect(getTopItems).toHaveBeenCalledWith({
      session: mockSession,
      timeRange: 'short_term',
      type: 'tracks',
      limit: 50,
    });
    // add more assertions as needed
  });
});
