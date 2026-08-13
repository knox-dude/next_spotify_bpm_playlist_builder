import { renderHook, act } from '@testing-library/react';
import useGenerateBpmSongs from '../../hooks/useGenerateBpmSongs';
import { generateBpmSongs } from '../../lib/generateBpmSongs';
import { Playlist, TrackWithAudioFeature } from '../../types/updatedTypes';

// Mocking the generateBpmSongs function
jest.mock('../../lib/generateBpmSongs', () => ({
  generateBpmSongs: jest.fn(),
}));

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

const params = {
  lowBpm: '60',
  highBpm: '120',
  doubleSpeed: false,
  halfSpeed: false,
  shortTerm: true,
  mediumTerm: false,
  longTerm: false,
  selectedPlaylists: [{ id: 'playlist1' } as Playlist],
};

describe('useGenerateBpmSongs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initial state', () => {
    const { result } = renderHook(() => useGenerateBpmSongs(mockSession));
    expect(result.current.loading).toBe(false);
    expect(result.current.result.tracks).toHaveLength(0);
    expect(result.current.progress).toBeNull();
    expect(result.current.completed).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('generates BPM songs successfully', async () => {
    const scan = {
      tracks: [{ id: 'track1' } as TrackWithAudioFeature],
      scannedCount: 12,
      sourceCount: 2,
    };
    (generateBpmSongs as jest.Mock).mockResolvedValue(scan);

    const { result } = renderHook(() => useGenerateBpmSongs(mockSession));

    await act(async () => {
      await result.current.generateSongs(params);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.result).toEqual(scan);
    expect(result.current.completed).toBe(true);
    expect(result.current.error).toBeNull();
    expect(generateBpmSongs).toHaveBeenCalledWith(
      expect.objectContaining({
        session: mockSession,
        lowBpm: 60,
        highBpm: 120,
        useDoubleSpeed: false,
        useHalfSpeed: false,
        useTopShortTerm: true,
        useTopMediumTerm: false,
        useTopLongTerm: false,
        playlists: [{ id: 'playlist1' }],
      }),
    );
  });

  test('exposes progress reported by the scan', async () => {
    (generateBpmSongs as jest.Mock).mockImplementation(async (options) => {
      options.onProgress({ phase: 'tempos', done: 5, total: 10 });
      return { tracks: [], scannedCount: 10, sourceCount: 1 };
    });

    const { result } = renderHook(() => useGenerateBpmSongs(mockSession));

    await act(async () => {
      await result.current.generateSongs(params);
    });

    // Progress is cleared once the scan is done - it only matters while waiting.
    expect(result.current.progress).toBeNull();
    expect(result.current.completed).toBe(true);
  });

  test('handles errors during BPM song generation', async () => {
    const mockError = new Error('Error generating BPM songs');
    (generateBpmSongs as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useGenerateBpmSongs(mockSession));

    await act(async () => {
      await result.current.generateSongs(params);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.result.tracks).toHaveLength(0);
    expect(result.current.completed).toBe(false);
    expect(result.current.error).toBe(
      'problem getting bpm songs: Error: Error generating BPM songs',
    );
  });
});
