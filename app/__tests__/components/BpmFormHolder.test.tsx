/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BpmFormHolder from '../../components/BpmFormHolder';
import { AuthSession } from '../../types/types';
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

jest.mock('../../components/ResultsView', () => ({
  __esModule: true,
  default: ({ result }: { result: any }) => (
    <div>
      <p>Results</p>
      <p>{result.tracks.length} tracks</p>
      <p>{result.sourceCount} sources</p>
    </div>
  ),
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

const emptyResult = { tracks: [], scannedCount: 0, sourceCount: 0 };

const mockUseGenerateBpmSongs = {
  generateSongs: jest.fn(),
  loading: false,
  progress: null as { phase: string; done: number; total: number } | null,
  result: emptyResult as any,
  completed: false,
  error: null,
  setCompleted: jest.fn(),
};

describe('BpmFormHolder', () => {
  beforeEach(() => {
    (useCreatePlaylist as jest.Mock).mockReturnValue(mockUseCreatePlaylist);
    (useGenerateBpmSongs as jest.Mock).mockReturnValue(mockUseGenerateBpmSongs);
  });

  test('renders BpmSubmitForm when not generating and not completed', () => {
    render(<BpmFormHolder session={mockSession} />);
    expect(screen.getByText('Generate BPM Songs')).toBeInTheDocument();
  });

  test('shows scan progress while generating', () => {
    mockUseGenerateBpmSongs.loading = true;
    mockUseGenerateBpmSongs.progress = {
      phase: 'tempos',
      done: 40,
      total: 200,
    };

    render(<BpmFormHolder session={mockSession} />);

    expect(screen.getByText('Looking up tempos')).toBeInTheDocument();
    expect(screen.getByText('40 of 200 songs')).toBeInTheDocument();
  });

  test('renders the results when completed', async () => {
    mockUseGenerateBpmSongs.result = {
      tracks: [{ id: 'track1' }],
      scannedCount: 30,
      sourceCount: 2,
    };
    mockUseGenerateBpmSongs.loading = false;
    mockUseGenerateBpmSongs.progress = null;
    mockUseGenerateBpmSongs.completed = true;

    render(<BpmFormHolder session={mockSession} />);

    await waitFor(() => {
      expect(screen.getByText('Results')).toBeInTheDocument();
      expect(screen.getByText('1 tracks')).toBeInTheDocument();
      expect(screen.getByText('2 sources')).toBeInTheDocument();
    });
  });

  test('handles BPM generation', () => {
    mockUseGenerateBpmSongs.loading = false;
    mockUseGenerateBpmSongs.completed = false;
    render(<BpmFormHolder session={mockSession} />);
    fireEvent.click(screen.getByText('Generate BPM Songs'));
    expect(mockUseGenerateBpmSongs.generateSongs).toHaveBeenCalled();
  });

  test('surfaces a failed scan instead of silently returning to the form', () => {
    mockUseGenerateBpmSongs.error = 'problem getting bpm songs: Error: nope' as any;

    render(<BpmFormHolder session={mockSession} />);

    expect(screen.getByRole('alert')).toHaveTextContent('problem getting bpm');
  });
});
