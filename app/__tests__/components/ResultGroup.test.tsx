import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ResultGroup from '../../components/ResultGroup';
import { useSelectedSongs } from '../../providers/SelectedSongsProvider';
import { TrackGroup } from '../../lib/grouping';
import { TrackWithAudioFeature } from '../../types/updatedTypes';

// Mock the useSelectedSongs hook
jest.mock('../../providers/SelectedSongsProvider', () => ({
  useSelectedSongs: jest.fn(),
}));

const mockUseSelectedSongs = useSelectedSongs as jest.Mock;

const mockTracks: TrackWithAudioFeature[] = [
  {
    id: 'track1',
    name: 'Track 1',
    artists: [{ id: 'artist1', name: 'Artist 1' }],
    analysis: { tempo: 120 },
    album: {
      images: [
        { url: 'https://via.placeholder.com/150', height: 150, width: 150 },
      ],
    },
  } as TrackWithAudioFeature,
  {
    id: 'track2',
    name: 'Track 2',
    artists: [{ id: 'artist1', name: 'Artist 1' }],
    analysis: { tempo: 150 },
    album: {
      images: [
        { url: 'https://via.placeholder.com/150', height: 150, width: 150 },
      ],
    },
  } as TrackWithAudioFeature,
];

const mockGroup: TrackGroup = {
  id: 'artist1',
  label: 'Artist 1',
  sublabel: '2 songs',
  image: 'https://via.placeholder.com/150',
  tracks: mockTracks,
};

describe('ResultGroup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSelectedSongs.mockReturnValue({
      selectedSongs: [],
      toggleSong: jest.fn(),
      selectSongs: jest.fn(),
      clearSongs: jest.fn(),
    });
  });

  test('renders the group heading and its cover art', () => {
    render(<ResultGroup group={mockGroup} />);

    expect(screen.getByText('Artist 1')).toBeInTheDocument();
    expect(screen.getByText('2 songs')).toBeInTheDocument();

    // The cover art is decorative - the group name is already rendered as text
    // beside it, so the image carries an empty alt rather than repeating it to
    // screen readers.
    const cover = document.querySelector('img[alt=""]');
    expect(cover).toBeInTheDocument();
    expect(cover).toHaveAttribute('src', expect.stringContaining('placeholder'));
  });

  test('toggles the expand and collapse state of the group', () => {
    render(<ResultGroup group={mockGroup} />);

    const disclosure = screen.getByRole('button', { expanded: false });
    expect(screen.queryByText('Track 1')).not.toBeInTheDocument();

    fireEvent.click(disclosure);

    expect(screen.getByText('Track 1')).toBeInTheDocument();
    expect(screen.getByText('Track 2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { expanded: true }));

    expect(screen.queryByText('Track 1')).not.toBeInTheDocument();
  });

  test('selects and clears every song in the group', () => {
    const selectSongs = jest.fn();
    const clearSongs = jest.fn();

    mockUseSelectedSongs.mockReturnValue({
      selectedSongs: [],
      toggleSong: jest.fn(),
      selectSongs,
      clearSongs,
    });

    const { rerender } = render(<ResultGroup group={mockGroup} />);

    const selectAll = screen.getByLabelText('Select every song in Artist 1');
    fireEvent.click(selectAll);
    expect(selectSongs).toHaveBeenCalledWith(mockTracks);

    // With everything already selected, the same control clears the group.
    mockUseSelectedSongs.mockReturnValue({
      selectedSongs: mockTracks,
      toggleSong: jest.fn(),
      selectSongs,
      clearSongs,
    });
    rerender(<ResultGroup group={mockGroup} />);

    fireEvent.click(screen.getByLabelText('Select every song in Artist 1'));
    expect(clearSongs).toHaveBeenCalledWith(mockTracks);
  });
});
