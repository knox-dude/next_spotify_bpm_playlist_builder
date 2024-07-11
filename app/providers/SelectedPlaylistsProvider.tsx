import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Playlist } from '../types/types';

interface SelectedPlaylistsContextProps {
  selectedPlaylists: Playlist[];
  togglePlaylist: (playlist: Playlist) => void;
}

const SelectedPlaylistsContext = createContext<SelectedPlaylistsContextProps | undefined>(undefined);

export const SelectedPlaylistsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedPlaylists, setSelectedPlaylists] = useState<Playlist[]>([]);

  const togglePlaylist = (playlist: Playlist) => {
    setSelectedPlaylists((prev) =>
      prev.some((p) => p.id === playlist.id)
        ? prev.filter((p) => p.id !== playlist.id)
        : [...prev, playlist]
    );
  };

  return (
    <SelectedPlaylistsContext.Provider value={{ selectedPlaylists, togglePlaylist }}>
      {children}
    </SelectedPlaylistsContext.Provider>
  );
};

export const useSelectedPlaylists = () => {
  const context = useContext(SelectedPlaylistsContext);
  if (!context) {
    throw new Error('useSelectedPlaylists must be used within a SelectedPlaylistsProvider');
  }
  return context;
};
