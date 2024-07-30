/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  SelectedPlaylistsProvider,
  useSelectedPlaylists,
} from '../../providers/SelectedPlaylistsProvider';
import { Playlist } from '../../types/updatedTypes';

const mockPlaylist1: Playlist = { id: '1', name: 'Playlist 1', images: [] };
const mockPlaylist2: Playlist = { id: '2', name: 'Playlist 2', images: [] };

const TestComponent = () => {
  const {
    selectedPlaylists,
    togglePlaylist,
    selectAllPlaylists,
    clearAllPlaylists,
  } = useSelectedPlaylists();

  return (
    <div>
      <button onClick={() => togglePlaylist(mockPlaylist1)}>
        Toggle Playlist 1
      </button>
      <button onClick={() => togglePlaylist(mockPlaylist2)}>
        Toggle Playlist 2
      </button>
      <button
        onClick={() => selectAllPlaylists([mockPlaylist1, mockPlaylist2])}
      >
        Select All
      </button>
      <button onClick={() => clearAllPlaylists()}>Clear All</button>
      <div>
        Selected Playlists:
        {selectedPlaylists.map((playlist) => (
          <span key={playlist.id}>{playlist.name}</span>
        ))}
      </div>
    </div>
  );
};

describe('SelectedPlaylistsProvider', () => {
  test('toggles playlist selection', () => {
    render(
      <SelectedPlaylistsProvider>
        <TestComponent />
      </SelectedPlaylistsProvider>,
    );

    const togglePlaylist1Button = screen.getByText('Toggle Playlist 1');
    const togglePlaylist2Button = screen.getByText('Toggle Playlist 2');

    // Toggle Playlist 1
    fireEvent.click(togglePlaylist1Button);
    expect(screen.getByText('Playlist 1')).toBeInTheDocument();

    // Toggle Playlist 1 again to remove it
    fireEvent.click(togglePlaylist1Button);
    expect(screen.queryByText('Playlist 1')).not.toBeInTheDocument();

    // Toggle Playlist 2
    fireEvent.click(togglePlaylist2Button);
    expect(screen.getByText('Playlist 2')).toBeInTheDocument();
  });

  test('selects all playlists', () => {
    render(
      <SelectedPlaylistsProvider>
        <TestComponent />
      </SelectedPlaylistsProvider>,
    );

    const selectAllButton = screen.getByText('Select All');
    fireEvent.click(selectAllButton);
    expect(screen.getByText('Playlist 1')).toBeInTheDocument();
    expect(screen.getByText('Playlist 2')).toBeInTheDocument();
  });

  test('clears all playlists', () => {
    render(
      <SelectedPlaylistsProvider>
        <TestComponent />
      </SelectedPlaylistsProvider>,
    );

    const selectAllButton = screen.getByText('Select All');
    const clearAllButton = screen.getByText('Clear All');

    // Select all playlists
    fireEvent.click(selectAllButton);
    expect(screen.getByText('Playlist 1')).toBeInTheDocument();
    expect(screen.getByText('Playlist 2')).toBeInTheDocument();

    // Clear all playlists
    fireEvent.click(clearAllButton);
    expect(screen.queryByText('Playlist 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Playlist 2')).not.toBeInTheDocument();
  });
});
