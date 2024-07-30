/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BpmFormHolder from '../../components/BpmFormHolder';
import { AuthSession } from '../../types/types';
import { signOut } from 'next-auth/react';
import useCreatePlaylist from '../../hooks/useCreatePlaylist';
import useGenerateBpmSongs from '../../hooks/useGenerateBpmSongs';

// Mocking dependencies
jest.mock('../../providers/SelectedPlaylistsProvider', () => ({
  SelectedPlaylistsProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock('../../providers/SelectedSongsProvider', () => ({
  SelectedSongsProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock('../../components/BpmSubmitForm', () => ({
  __esModule: true,
  default: ({ handleBpmGeneration }: { handleBpmGeneration: () => void }) => (
    <div>
      <button onClick={handleBpmGeneration}>Generate BPM Songs</button>
    </div>
  ),
}));

jest.mock('../../components/ResultPlaylist', () => ({
  __esModule: true,
  default: ({ playlist, tracks }: { playlist: any; tracks: any }) => (
    <div>
      <p>Result Playlist</p>
      <p>{playlist.name}</p>
      <p>{tracks.length} tracks</p>
    </div>
  ),
}));

jest.mock('../../components/SaveSongsButton', () => ({
  __esModule: true,
  default: ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick}>Save Songs</button>
  ),
}));

jest.mock('../../components/TextInput', () => ({
  __esModule: true,
  default: ({
    className,
    label,
    value,
    placeholder,
    onChange,
  }: {
    className: string;
    label: string;
    value: string;
    placeholder: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <input
      className={className}
      aria-label={label}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
    />
  ),
}));

jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
}));

jest.mock('../../hooks/useCreatePlaylist', () => jest.fn());
jest.mock('../../hooks/useGenerateBpmSongs', () => jest.fn());

const mockSession: AuthSession = {
  user: {
    sub: '123',
    accessToken: 'mockAccessToken',
  },
} as AuthSession;

const mockUseCreatePlaylist = {
  createPlaylistAndAddTracks: jest.fn(),
  loading: false,
  error: null,
};

const mockUseGenerateBpmSongs = {
  generateSongs: jest.fn(),
  loading: false,
  results: new Map(),
  completed: false,
  error: null,
  setCompleted: jest.fn(),
};

describe('BpmFormHolder', () => {
  beforeEach(() => {
    (useCreatePlaylist as jest.Mock).mockReturnValue(mockUseCreatePlaylist);
    (useGenerateBpmSongs as jest.Mock).mockReturnValue(mockUseGenerateBpmSongs);
  });

  test('renders sign out button', () => {
    render(<BpmFormHolder session={mockSession} />);

    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });

  test('calls sign out when sign out button is clicked', () => {
    render(<BpmFormHolder session={mockSession} />);
    fireEvent.click(screen.getByText('Sign out'));
    expect(signOut).toHaveBeenCalled();
  });

  test('renders BpmSubmitForm when not generating and not completed', () => {
    render(<BpmFormHolder session={mockSession} />);
    expect(screen.getByText('Generate BPM Songs')).toBeInTheDocument();
  });

  test('shows loading spinner when generating', () => {
    mockUseGenerateBpmSongs.loading = true;
    render(<BpmFormHolder session={mockSession} />);
    expect(
      screen.getByText('Please sit back and relax, this could take a while...'),
    ).toBeInTheDocument();
  });

  test('renders result playlists when completed', async () => {
    const mockResults = new Map();
    mockResults.set({ id: 'playlist1', name: 'Playlist 1' }, [
      { id: 'track1' },
    ]);
    mockUseGenerateBpmSongs.results = mockResults;
    mockUseGenerateBpmSongs.loading = false;
    mockUseGenerateBpmSongs.completed = true;

    render(<BpmFormHolder session={mockSession} />);

    await waitFor(() => {
      expect(screen.getByText('Playlist 1')).toBeInTheDocument();
      expect(screen.getByText('1 tracks')).toBeInTheDocument();
    });
  });

  test('handles BPM generation', () => {
    mockUseGenerateBpmSongs.loading = false;
    mockUseGenerateBpmSongs.completed = false;
    render(<BpmFormHolder session={mockSession} />);
    fireEvent.click(screen.getByText('Generate BPM Songs'));
    expect(mockUseGenerateBpmSongs.generateSongs).toHaveBeenCalled();
  });
});
