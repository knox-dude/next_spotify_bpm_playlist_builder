import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResultPlaylist from '../../components/ResultPlaylist';
import { useSelectedSongs } from '../../providers/SelectedSongsProvider';
import {
  AudioFeatures,
  Playlist,
  SimplifiedAlbum,
  SimplifiedArtist,
  TrackWithAudioFeature,
} from '../../types/updatedTypes';

// Mock the useSelectedSongs hook
jest.mock('../../providers/SelectedSongsProvider', () => ({
  useSelectedSongs: jest.fn(),
}));

const mockUseSelectedSongs = useSelectedSongs as jest.Mock;

const mockPlaylist: Playlist = {
  id: '1',
  name: 'Test Playlist',
  images: [{ url: 'https://via.placeholder.com/150' }],
} as Playlist;

const mockTracks: TrackWithAudioFeature[] = [
  {
    id: 'track1',
    name: 'Track 1',
    artists: [{ id: 'artist1', name: 'Artist 1' }],
    analysis: {
      tempo: 120,
    },
    album: {
      images: [
        { url: 'https://via.placeholder.com/150', height: 150, width: 150 },
      ],
    },
  } as TrackWithAudioFeature,
  {
    id: 'track2',
    name: 'Track 2',
    artists: [{ id: 'artist2', name: 'Artist 2' } as SimplifiedArtist],
    analysis: {
      tempo: 150,
    },
    album: {
      images: [
        { url: 'https://via.placeholder.com/150', height: 150, width: 150 },
      ],
    },
  } as TrackWithAudioFeature,
];

describe('ResultPlaylist', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSelectedSongs.mockReturnValue({
      selectedSongs: [],
      toggleSong: jest.fn(),
      selectSongs: jest.fn(),
      clearSongs: jest.fn(),
    });
  });

  // smoke test
  test('renders the playlist and tracks correctly', () => {
    render(<ResultPlaylist playlist={mockPlaylist} tracks={mockTracks} />);

    // Check if the playlist name is rendered
    expect(screen.getByText('Test Playlist')).toBeInTheDocument();

    // Check if the playlist image is rendered
    expect(screen.getByAltText('Test Playlist')).toBeInTheDocument();

    // Check if the checkbox icon is rendered
    expect(screen.getByLabelText('checkbox-unchecked')).toBeInTheDocument();

    // Check if the expand icon is rendered
    expect(screen.getByLabelText('expand-more')).toBeInTheDocument();
  });

  test('toggles the expand and collapse state of the playlist', () => {
    render(<ResultPlaylist playlist={mockPlaylist} tracks={mockTracks} />);

    const expandIcon = screen.getByLabelText('expand-more');
    fireEvent.click(expandIcon);

    // Check if tracks are rendered when expanded
    waitFor(() => {
      expect(screen.getByText('Track 1')).toBeInTheDocument();
      expect(screen.getByText('Track 2')).toBeInTheDocument();
    });

    fireEvent.click(expandIcon);

    // Check if tracks are not rendered when collapsed
    waitFor(() => {
      expect(screen.queryByText('Track 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Track 2')).not.toBeInTheDocument();
    });
  });

  test('toggles the selection state of the playlist', () => {
    const selectSongs = jest.fn();
    const clearSongs = jest.fn();

    mockUseSelectedSongs.mockReturnValue({
      selectedSongs: [],
      toggleSong: jest.fn(),
      selectSongs,
      clearSongs,
    });

    render(<ResultPlaylist playlist={mockPlaylist} tracks={mockTracks} />);

    const checkboxIcon = screen.getByLabelText('checkbox-unchecked');
    fireEvent.click(checkboxIcon);

    // Check that the checkbox is checked
    waitFor(() => {
      expect(screen.getByLabelText('checkbox-checked')).toBeInTheDocument();
    });

    // Check if the selectSongs function is called
    expect(selectSongs).toHaveBeenCalledWith(mockTracks);

    fireEvent.click(checkboxIcon);

    waitFor(() => {
      expect(screen.getByLabelText('checkbox-unchecked')).toBeInTheDocument();
    });

    // Check if the toggleSongs function is called
    expect(selectSongs).toHaveBeenCalledWith(mockTracks);
  });
});
