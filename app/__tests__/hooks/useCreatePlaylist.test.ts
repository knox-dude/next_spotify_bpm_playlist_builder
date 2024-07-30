/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import useCreatePlaylist from '../../hooks/useCreatePlaylist';
import { createPlaylist, addSongsToPlaylist } from '../../lib/actions';
import { AuthSession } from '../../types/types';
import { TrackWithAudioFeature } from '../../types/updatedTypes';

// Mocking the createPlaylist and addSongsToPlaylist functions
jest.mock('../../lib/actions', () => ({
  createPlaylist: jest.fn(),
  addSongsToPlaylist: jest.fn(),
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

describe('useCreatePlaylist', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initial state', () => {
    const { result } = renderHook(() => useCreatePlaylist(mockSession));
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('creates a playlist and adds songs successfully', async () => {
    const mockCreateResponse = { id: 'newPlaylistId' };
    const mockAddResponse = { snapshot_id: 'snapshotId' };
    (createPlaylist as jest.Mock).mockResolvedValue(mockCreateResponse);
    (addSongsToPlaylist as jest.Mock).mockResolvedValue(mockAddResponse);

    const { result } = renderHook(() => useCreatePlaylist(mockSession));
    const { createPlaylistAndAddTracks } = result.current;

    const playlistName = 'Test Playlist';
    const songs: TrackWithAudioFeature[] = [
      { id: 'track1' } as TrackWithAudioFeature,
    ];

    await act(async () => {
      const playlistId = await createPlaylistAndAddTracks(playlistName, songs);
      expect(playlistId).toBe('newPlaylistId');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(createPlaylist).toHaveBeenCalledWith(mockSession, playlistName);
    expect(addSongsToPlaylist).toHaveBeenCalledWith(
      mockSession,
      'newPlaylistId',
      ['track1'],
    );
  });

  test('throws error when playlist name is missing', async () => {
    const { result } = renderHook(() => useCreatePlaylist(mockSession));
    const { createPlaylistAndAddTracks } = result.current;

    await act(async () => {
      await expect(createPlaylistAndAddTracks('', [])).rejects.toThrow(
        'Playlist name is required',
      );
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(createPlaylist).not.toHaveBeenCalled();
    expect(addSongsToPlaylist).not.toHaveBeenCalled();
  });

  test('throws error when no songs are provided', async () => {
    const { result } = renderHook(() => useCreatePlaylist(mockSession));
    const { createPlaylistAndAddTracks } = result.current;

    await act(async () => {
      await expect(
        createPlaylistAndAddTracks('Test Playlist', []),
      ).rejects.toThrow('At least one song is required to create a playlist');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(createPlaylist).not.toHaveBeenCalled();
    expect(addSongsToPlaylist).not.toHaveBeenCalled();
  });

  test('handles errors from createPlaylist', async () => {
    const mockError = {
      error: { status: 400, message: 'Bad Request' },
    };
    (createPlaylist as jest.Mock).mockResolvedValue(mockError);

    const { result } = renderHook(() => useCreatePlaylist(mockSession));
    const { createPlaylistAndAddTracks } = result.current;

    const playlistName = 'Test Playlist';
    const songs: TrackWithAudioFeature[] = [
      { id: 'track1' } as TrackWithAudioFeature,
    ];

    await act(async () => {
      await expect(
        createPlaylistAndAddTracks(playlistName, songs),
      ).rejects.toThrow('Failed to create playlist - 400 - Bad Request');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(
      'Failed to create playlist - 400 - Bad Request',
    );
    expect(createPlaylist).toHaveBeenCalledWith(mockSession, playlistName);
    expect(addSongsToPlaylist).not.toHaveBeenCalled();
  });

  test('handles errors from addSongsToPlaylist', async () => {
    const mockCreateResponse = { id: 'newPlaylistId' };
    const mockError = {
      error: { status: 400, message: 'Bad Request' },
    };
    (createPlaylist as jest.Mock).mockResolvedValue(mockCreateResponse);
    (addSongsToPlaylist as jest.Mock).mockResolvedValue(mockError);

    const { result } = renderHook(() => useCreatePlaylist(mockSession));
    const { createPlaylistAndAddTracks } = result.current;

    const playlistName = 'Test Playlist';
    const songs: TrackWithAudioFeature[] = [
      { id: 'track1' } as TrackWithAudioFeature,
    ];

    await act(async () => {
      await expect(
        createPlaylistAndAddTracks(playlistName, songs),
      ).rejects.toThrow('Failed to add songs to playlist - 400 - Bad Request');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(
      'Failed to add songs to playlist - 400 - Bad Request',
    );
    expect(createPlaylist).toHaveBeenCalledWith(mockSession, playlistName);
    expect(addSongsToPlaylist).toHaveBeenCalledWith(
      mockSession,
      'newPlaylistId',
      ['track1'],
    );
  });
});
