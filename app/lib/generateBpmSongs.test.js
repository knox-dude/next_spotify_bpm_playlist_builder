import {
  chunkArray,
  keepSongsInCorrectBpmRange,
  generateBpmSongs,
} from './generateBpmSongs';
import * as actions from './actions';

jest.mock('./actionsCopy', () => ({
  getManyTrackAnalysis: jest.fn(),
  getTrackFromPlaylistLink: jest.fn(),
  getTopItems: jest.fn(),
  keepSongsInCorrectBpmRange: jest.fn(),
}));

const mockAnalysis = [
  { id: '1', tempo: 110 },
  { id: '2', tempo: 90 },
  { id: '3', tempo: 120 },
  { id: '4', tempo: 100 },
  { id: '5', tempo: 50 },
  { id: '6', tempo: 40 },
  { id: '7', tempo: 200 },
  { id: '8', tempo: 220 },
];
const mockSongs = [
  { id: '1', name: 'Song 1' },
  { id: '2', name: 'Song 2' },
  { id: '3', name: 'Song 3' },
  { id: '4', name: 'Song 4' },
  { id: '5', name: 'Song 5' },
  { id: '6', name: 'Song 6' },
  { id: '7', name: 'Song 7' },
  { id: '8', name: 'Song 8' },
];

const now = new Date();
const hourFromNow = now.getTime() + 60 * 60 * 1000;
const mockSession = {
  user: {
    name: 'Test User',
    email: 'test@gmail.com',
    accessToken: 'fake-access-token',
    sub: 'test-user',
    expires_at: hourFromNow,
  },
  expires: now.toISOString(),
};

describe('chunkArray', () => {
  it('should split array into chunks', () => {
    const array = [1, 2, 3, 4, 5];
    const chunkSize = 2;
    const expected = [[1, 2], [3, 4], [5]];

    expect(chunkArray(array, chunkSize)).toEqual(expected);
  });

  it('should handle empty array', () => {
    const array = [];
    const chunkSize = 2;
    const expected = [];

    expect(chunkArray(array, chunkSize)).toEqual(expected);
  });
});

describe('keepSongsInCorrectBpmRange', () => {
  const chunkedSongs = [mockSongs];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should filter songs within the BPM range', async () => {
    actions.getManyTrackAnalysis.mockResolvedValue(mockAnalysis);

    const result = await keepSongsInCorrectBpmRange(
      100,
      120,
      chunkedSongs,
      mockSession,
      false,
      false,
    );

    expect(result).toHaveLength(3);
    for (let i = 0; i < result.length; i++) {
      expect(result[i].analysis.tempo).toBeGreaterThanOrEqual(100);
      expect(result[i].analysis.tempo).toBeLessThanOrEqual(120);
    }
  });

  it('should handle double speed songs', async () => {
    actions.getManyTrackAnalysis.mockResolvedValue(mockAnalysis);

    const result = await keepSongsInCorrectBpmRange(
      100,
      120,
      chunkedSongs,
      mockSession,
      true,
      false,
    );

    expect(result).toHaveLength(5);
  });

  it('should handle half speed songs', async () => {
    actions.getManyTrackAnalysis.mockResolvedValue(mockAnalysis);

    const result = await keepSongsInCorrectBpmRange(
      100,
      120,
      chunkedSongs,
      mockSession,
      false,
      true,
    );

    expect(result).toHaveLength(4);
  });

  it('should handle empty analysis', async () => {
    actions.getManyTrackAnalysis.mockResolvedValue([]);

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
  const mockPlaylist = {
    id: '1',
    name: 'Test Playlist',
    tracks: {
      total: 8,
    },
  };

  const mockPlaylistedSongs = mockSongs.map((song) => ({
    track: {
      ...song,
    },
  }));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate BPM songs within the range', async () => {
    actions.getManyTrackAnalysis.mockResolvedValue(mockAnalysis);
    actions.getTrackFromPlaylistLink.mockResolvedValue(mockPlaylistedSongs);

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

    expect(result.size).toBe(1);
    expect(result.get(mockPlaylist)).toHaveLength(3);
  });

  it('should handle empty playlists', async () => {
    const emptyPlaylist = {
      ...mockPlaylist,
      tracks: {
        ...mockPlaylist.tracks,
        total: 0,
      },
    };
    actions.getTrackFromPlaylistLink.mockResolvedValue([]);
    actions.getManyTrackAnalysis.mockResolvedValue([]);

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

    expect(result.size).toBe(1);
    expect(result.get(emptyPlaylist)).toBeUndefined();
  });
});
