import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  SelectedSongsProvider,
  useSelectedSongs,
} from '../../providers/SelectedSongsProvider';
import { AudioFeatures, TrackWithAudioFeature } from '../../types/updatedTypes';

const mockSong1: TrackWithAudioFeature = {
  id: '1',
  name: 'Song 1',
  analysis: {
    tempo: 120,
  } as AudioFeatures,
} as TrackWithAudioFeature;
const mockSong2: TrackWithAudioFeature = {
  id: '2',
  name: 'Song 2',
  analysis: {
    tempo: 130,
  },
} as TrackWithAudioFeature;

const TestComponent = () => {
  const { selectedSongs, toggleSong, selectSongs, clearSongs } =
    useSelectedSongs();

  return (
    <div>
      <button onClick={() => toggleSong(mockSong1)}>Toggle Song 1</button>
      <button onClick={() => toggleSong(mockSong2)}>Toggle Song 2</button>
      <button onClick={() => selectSongs([mockSong1, mockSong2])}>
        Select All
      </button>
      <button onClick={() => clearSongs([mockSong1, mockSong2])}>
        Clear All
      </button>
      <div>
        Selected Songs:
        {selectedSongs.map((song) => (
          <span key={song.id}>{song.name}</span>
        ))}
      </div>
    </div>
  );
};

describe('SelectedSongsProvider', () => {
  test('toggles song selection', () => {
    render(
      <SelectedSongsProvider>
        <TestComponent />
      </SelectedSongsProvider>,
    );

    const toggleSong1Button = screen.getByText('Toggle Song 1');
    const toggleSong2Button = screen.getByText('Toggle Song 2');

    // Toggle Song 1
    fireEvent.click(toggleSong1Button);
    expect(screen.getByText('Song 1')).toBeInTheDocument();

    // Toggle Song 1 again to remove it
    fireEvent.click(toggleSong1Button);
    expect(screen.queryByText('Song 1')).not.toBeInTheDocument();

    // Toggle Song 2
    fireEvent.click(toggleSong2Button);
    expect(screen.getByText('Song 2')).toBeInTheDocument();
  });

  test('selects all songs', () => {
    render(
      <SelectedSongsProvider>
        <TestComponent />
      </SelectedSongsProvider>,
    );

    const selectAllButton = screen.getByText('Select All');
    fireEvent.click(selectAllButton);
    expect(screen.getByText('Song 1')).toBeInTheDocument();
    expect(screen.getByText('Song 2')).toBeInTheDocument();
  });

  test('clears all songs', () => {
    render(
      <SelectedSongsProvider>
        <TestComponent />
      </SelectedSongsProvider>,
    );

    const selectAllButton = screen.getByText('Select All');
    const clearAllButton = screen.getByText('Clear All');

    // Select all songs
    fireEvent.click(selectAllButton);
    expect(screen.getByText('Song 1')).toBeInTheDocument();
    expect(screen.getByText('Song 2')).toBeInTheDocument();

    // Clear all songs
    fireEvent.click(clearAllButton);
    expect(screen.queryByText('Song 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Song 2')).not.toBeInTheDocument();
  });
});
