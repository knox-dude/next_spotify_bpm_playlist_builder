import React from 'react';
import {
  act,
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react';
// import '@testing-library/jest-dom/extend-expect';
import PlaylistInputCardList from '../../components/PlaylistInputCardList';
import { useSelectedPlaylists } from '../../providers/SelectedPlaylistsProvider';
import { getAllUserLikedPlaylists } from '../../lib/actions';
import '@testing-library/jest-dom';

// Mock the useSelectedPlaylists hook
jest.mock('../../providers/SelectedPlaylistsProvider', () => ({
  useSelectedPlaylists: jest.fn(),
}));

const mockUseSelectedPlaylists = useSelectedPlaylists;

// Mock the getAllUserLikedPlaylists function
jest.mock('../../lib/actions', () => ({
  getAllUserLikedPlaylists: jest.fn(),
}));

const mockGetAllUserLikedPlaylists = getAllUserLikedPlaylists;

const mockSession = {
  user: {
    sub: '123',
    accessToken: 'mockAccessToken',
  },
};

const mockPlaylists = [
  { id: '1', name: 'Playlist 1' },
  { id: '2', name: 'Playlist 2' },
  { id: '3', name: 'Playlist 3' },
];

describe('PlaylistInputCardList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSelectedPlaylists.mockReturnValue({
      selectedPlaylists: [],
      togglePlaylist: jest.fn(),
      selectAllPlaylists: jest.fn(),
      clearAllPlaylists: jest.fn(),
    });
    mockGetAllUserLikedPlaylists.mockResolvedValue(mockPlaylists);
  });

  test('renders the loading spinner initially', () => {
    render(<PlaylistInputCardList session={mockSession} />);
    expect(screen.getByText('Loading your playlists...')).toBeInTheDocument();
  });

  test('displays playlists after loading', async () => {
    await act(async () => {
      render(<PlaylistInputCardList session={mockSession} />);
    });
    await waitFor(() => {
      expect(screen.getByText('Playlist 1')).toBeInTheDocument();
      expect(screen.getByText('Playlist 2')).toBeInTheDocument();
      expect(screen.getByText('Playlist 3')).toBeInTheDocument();
    });
  });

  test('filters playlists based on search input', async () => {
    await act(async () => {
      render(<PlaylistInputCardList session={mockSession} />);
    });

    await waitFor(() => {
      expect(screen.getByText('Playlist 1')).toBeInTheDocument();
      expect(screen.getByText('Playlist 2')).toBeInTheDocument();
      expect(screen.getByText('Playlist 3')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search for playlist');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: '1' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Playlist 1')).toBeInTheDocument();
      expect(screen.queryByText('Playlist 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Playlist 3')).not.toBeInTheDocument();
    });
  });

  test('selects all playlists when "Select All" button is clicked', async () => {
    const selectAllPlaylists = jest.fn();
    mockUseSelectedPlaylists.mockReturnValue({
      selectedPlaylists: [],
      togglePlaylist: jest.fn(),
      selectAllPlaylists,
      clearAllPlaylists: jest.fn(),
    });

    await act(async () => {
      render(<PlaylistInputCardList session={mockSession} />);
    });
    await waitFor(() => {
      expect(screen.getByText('Playlist 1')).toBeInTheDocument();
    });

    const selectAllButton = screen.getByText('Select All');
    await act(async () => {
      fireEvent.click(selectAllButton);
    });

    expect(selectAllPlaylists).toHaveBeenCalledWith(mockPlaylists);
  });

  test('clears all selected playlists when "Select None" button is clicked', async () => {
    const clearAllPlaylists = jest.fn();
    mockUseSelectedPlaylists.mockReturnValue({
      selectedPlaylists: mockPlaylists,
      togglePlaylist: jest.fn(),
      selectAllPlaylists: jest.fn(),
      clearAllPlaylists,
    });

    await act(async () => {
      render(<PlaylistInputCardList session={mockSession} />);
    });
    await waitFor(() => {
      expect(screen.getByText('Playlist 1')).toBeInTheDocument();
    });
    const selectNoneButton = screen.getByText('Select None');
    await act(async () => {
      fireEvent.click(selectNoneButton);
    });
    expect(clearAllPlaylists).toHaveBeenCalled();
  });

  test('displays "No playlists found" when search yields no results', async () => {
    await act(async () => {
      render(<PlaylistInputCardList session={mockSession} />);
    });
    await waitFor(() => {
      expect(screen.getByText('Playlist 1')).toBeInTheDocument();
    });
    const searchInput = screen.getByPlaceholderText('Search for playlist');

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    });

    await waitFor(() => {
      expect(screen.getByText('No playlists found')).toBeInTheDocument();
    });
  });
});
