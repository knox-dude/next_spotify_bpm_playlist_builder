import {
  chunkArray,
  matchSongsToTempos,
  generateBpmSongs,
} from '../../lib/generateBpmSongs';
import * as actions from '../../lib/actions';
import * as bpm from '../../lib/bpm';

jest.mock('../../lib/actions', () => ({
  getTrackFromPlaylistLink: jest.fn(),
  getAllUserSavedTracks: jest.fn(),
  getTopItems: jest.fn(),
  getArtistGenres: jest.fn(),
}));

jest.mock('../../lib/bpm', () => ({
  getTempos: jest.fn(),
}));

const mockAnalysis = [
  { id: '1', tempo: 110, source: 'reccobeats' },
  { id: '2', tempo: 90, source: 'reccobeats' },
  { id: '3', tempo: 120, source: 'reccobeats' },
  { id: '4', tempo: 100, source: 'reccobeats' },
  { id: '5', tempo: 50, source: 'deezer' },
  { id: '6', tempo: 40, source: 'deezer' },
  { id: '7', tempo: 200, source: 'reccobeats' },
  { id: '8', tempo: 220, source: 'reccobeats' },
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

const temposById = (analyses) =>
  new Map(analyses.map((analysis) => [analysis.id, analysis]));

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

describe('matchSongsToTempos', () => {
  it('keeps only songs inside the BPM range', () => {
    const result = matchSongsToTempos(
      mockSongs,
      temposById(mockAnalysis),
      100,
      120,
      false,
      false,
    );

    expect(result).toHaveLength(3);
    result.forEach((track) => {
      expect(track.analysis.tempo).toBeGreaterThanOrEqual(100);
      expect(track.analysis.tempo).toBeLessThanOrEqual(120);
    });
  });

  it('handles double speed songs', () => {
    const result = matchSongsToTempos(
      mockSongs,
      temposById(mockAnalysis),
      100,
      120,
      true,
      false,
    );

    expect(result).toHaveLength(5);
  });

  it('handles half speed songs', () => {
    const result = matchSongsToTempos(
      mockSongs,
      temposById(mockAnalysis),
      100,
      120,
      false,
      true,
    );

    expect(result).toHaveLength(4);
  });

  it('returns nothing when no tempo was resolved', () => {
    const result = matchSongsToTempos(
      mockSongs,
      new Map(),
      100,
      120,
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

  const scan = (overrides = {}) =>
    generateBpmSongs({
      session: mockSession,
      lowBpm: 100,
      highBpm: 120,
      playlists: [mockPlaylist],
      ...overrides,
    });

  beforeEach(() => {
    jest.clearAllMocks();
    actions.getArtistGenres.mockResolvedValue({});
  });

  it('returns every match as one flat list, slowest first', async () => {
    bpm.getTempos.mockResolvedValue(mockAnalysis);
    actions.getTrackFromPlaylistLink.mockResolvedValue(mockPlaylistedSongs);

    const result = await scan();

    expect(result.tracks).toHaveLength(3);
    expect(result.tracks.map((track) => track.analysis.tempo)).toEqual([
      100, 110, 120,
    ]);
    expect(result.scannedCount).toBe(8);
    expect(result.sourceCount).toBe(1);
  });

  it('handles empty playlists', async () => {
    actions.getTrackFromPlaylistLink.mockResolvedValue([]);
    bpm.getTempos.mockResolvedValue([]);

    const result = await scan();

    expect(result.tracks).toEqual([]);
    expect(result.scannedCount).toBe(0);
  });

  it('looks a song up once even when several sources contain it', async () => {
    bpm.getTempos.mockResolvedValue(mockAnalysis);
    actions.getTrackFromPlaylistLink.mockResolvedValue(mockPlaylistedSongs);

    const result = await scan({
      playlists: [mockPlaylist, { ...mockPlaylist, id: '2' }],
    });

    expect(result.scannedCount).toBe(8);
    expect(result.tracks).toHaveLength(3);
    expect(bpm.getTempos).toHaveBeenCalledTimes(1);
    expect(bpm.getTempos.mock.calls[0][0]).toHaveLength(8);
  });

  it('attaches the primary artist genres to each match', async () => {
    bpm.getTempos.mockResolvedValue([mockAnalysis[0]]);
    actions.getTrackFromPlaylistLink.mockResolvedValue([
      { track: { ...mockSongs[0], artists: [{ id: 'artist1' }] } },
    ]);
    actions.getArtistGenres.mockResolvedValue({ artist1: ['indie rock'] });

    const result = await scan();

    expect(actions.getArtistGenres).toHaveBeenCalledWith(mockSession, [
      'artist1',
    ]);
    expect(result.tracks[0].genres).toEqual(['indie rock']);
  });

  it('still returns matches when the genre lookup fails', async () => {
    bpm.getTempos.mockResolvedValue([mockAnalysis[0]]);
    actions.getTrackFromPlaylistLink.mockResolvedValue([
      { track: { ...mockSongs[0], artists: [{ id: 'artist1' }] } },
    ]);
    actions.getArtistGenres.mockRejectedValue(new Error('spotify is down'));

    const result = await scan();

    expect(result.tracks).toHaveLength(1);
    expect(result.tracks[0].genres).toBeUndefined();
  });

  it('reports progress as it works', async () => {
    bpm.getTempos.mockResolvedValue(mockAnalysis);
    actions.getTrackFromPlaylistLink.mockResolvedValue(mockPlaylistedSongs);
    const onProgress = jest.fn();

    await scan({ onProgress });

    const phases = onProgress.mock.calls.map(([progress]) => progress.phase);
    expect(phases).toContain('sources');
    expect(phases).toContain('tempos');
    expect(onProgress).toHaveBeenCalledWith({
      phase: 'sources',
      done: 1,
      total: 1,
    });
  });

  it('refuses to scan nothing', async () => {
    await expect(scan({ playlists: [] })).rejects.toThrow(
      /No playlists or top tracks selected/,
    );
  });
});

describe('tempo lookup chunking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    actions.getArtistGenres.mockResolvedValue({});
  });

  it('splits large selections across multiple provider calls', async () => {
    // 250 tracks must not go out as one long-running server action - hosts
    // cap function duration (Vercel Hobby at 10s).
    const many = Array.from({ length: 250 }, (_, i) => ({
      id: `big${i}`,
      name: `Song ${i}`,
    }));
    actions.getTrackFromPlaylistLink.mockResolvedValue(
      many.map((track) => ({ track })),
    );
    bpm.getTempos.mockResolvedValue([]);

    await generateBpmSongs({
      session: mockSession,
      lowBpm: 100,
      highBpm: 120,
      playlists: [{ id: '1', name: 'Big Playlist', tracks: { total: 250 } }],
    });

    // 250 tracks at 120 per call => 3 calls.
    expect(bpm.getTempos).toHaveBeenCalledTimes(3);
    bpm.getTempos.mock.calls.forEach(([batch]) => {
      expect(batch.length).toBeLessThanOrEqual(120);
    });
  });

  it('runs those calls concurrently rather than one after another', async () => {
    const many = Array.from({ length: 360 }, (_, i) => ({
      id: `big${i}`,
      name: `Song ${i}`,
    }));
    actions.getTrackFromPlaylistLink.mockResolvedValue(
      many.map((track) => ({ track })),
    );

    let inFlight = 0;
    let peak = 0;
    bpm.getTempos.mockImplementation(async () => {
      inFlight += 1;
      peak = Math.max(peak, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 5));
      inFlight -= 1;
      return [];
    });

    await generateBpmSongs({
      session: mockSession,
      lowBpm: 100,
      highBpm: 120,
      playlists: [{ id: '1', name: 'Big Playlist', tracks: { total: 360 } }],
    });

    expect(peak).toBeGreaterThan(1);
  });
});
