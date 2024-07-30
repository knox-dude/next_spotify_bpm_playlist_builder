import { renderHook, act } from '@testing-library/react';
import useGenerateBpmSongs from '../../hooks/useGenerateBpmSongs';
import { generateBpmSongs } from '../../lib/generateBpmSongs';
import { AuthSession } from '../../types/types';
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

describe('useGenerateBpmSongs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initial state', () => {
    const { result } = renderHook(() => useGenerateBpmSongs(mockSession));
    expect(result.current.loading).toBe(false);
    expect(result.current.results.size).toBe(0);
    expect(result.current.completed).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('generates BPM songs successfully', async () => {
    const mockResult = new Map<Playlist, TrackWithAudioFeature[]>();
    mockResult.set({ id: 'playlist1' } as Playlist, [
      { id: 'track1' } as TrackWithAudioFeature,
    ]);

    (generateBpmSongs as jest.Mock).mockResolvedValue(mockResult);

    const { result } = renderHook(() => useGenerateBpmSongs(mockSession));
    const { generateSongs } = result.current;

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

    await act(async () => {
      await generateSongs(params);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.results).toEqual(mockResult);
    expect(result.current.completed).toBe(true);
    expect(result.current.error).toBeNull();
    expect(generateBpmSongs).toHaveBeenCalledWith(
      60,
      120,
      false,
      false,
      true,
      false,
      false,
      mockSession,
      [{ id: 'playlist1' }],
    );
  });

  test('handles errors during BPM song generation', async () => {
    const mockError = new Error('Error generating BPM songs');
    (generateBpmSongs as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useGenerateBpmSongs(mockSession));
    const { generateSongs } = result.current;

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

    await act(async () => {
      await generateSongs(params);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.results.size).toBe(0);
    expect(result.current.completed).toBe(false);
    expect(result.current.error).toBe(
      'problem getting bpm songs: Error: Error generating BPM songs',
    );
    expect(generateBpmSongs).toHaveBeenCalledWith(
      60,
      120,
      false,
      false,
      true,
      false,
      false,
      mockSession,
      [{ id: 'playlist1' }],
    );
  });
});
