import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Playlist, TrackWithAnalysis } from '../types/types';

interface SelectedSongsContextProps {
  selectedSongs: TrackWithAnalysis[];
  toggleSong: (song: TrackWithAnalysis) => void;
  selectSongs: (songs: TrackWithAnalysis[]) => void;
  clearSongs: (songs: TrackWithAnalysis[]) => void;
}

const SelectedSongsContext = createContext<SelectedSongsContextProps | undefined>(undefined);

export const SelectedSongsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedSongs, setSelectedSongs] = useState<TrackWithAnalysis[]>([]);

  const toggleSong = (song: TrackWithAnalysis) => {
    setSelectedSongs((prev) =>
      prev.some((p) => p.id === song.id)
        ? prev.filter((p) => p.id !== song.id)
        : [...prev, song]
    );
  };

  const selectSongs = (songs: TrackWithAnalysis[]) => {
    const songIds = new Set(songs.map((song) => (song.id)));
    setSelectedSongs((prev) => [...prev.filter((song) => !(songIds.has(song.id))), ...songs]);
  }

  const clearSongs = (songs: TrackWithAnalysis[]) => {
    const songIds = new Set(songs.map((song) => song.id));
    setSelectedSongs((prev) => prev.filter((song) => !(songIds.has(song.id))));
  }

  return (
    <SelectedSongsContext.Provider value={{ selectedSongs, toggleSong, selectSongs, clearSongs }}>
      {children}
    </SelectedSongsContext.Provider>
  );
};

export const useSelectedSongs = () => {
  const context = useContext(SelectedSongsContext);
  if (!context) {
    throw new Error('useSelectedSongs must be used within a SelectedSongsProvider');
  }
  return context;
};
