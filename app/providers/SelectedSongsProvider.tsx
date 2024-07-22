import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Playlist, TrackWithAudioFeature } from '../types/updatedTypes';

interface SelectedSongsContextProps {
  selectedSongs: TrackWithAudioFeature[];
  toggleSong: (song: TrackWithAudioFeature) => void;
  selectSongs: (songs: TrackWithAudioFeature[]) => void;
  clearSongs: (songs: TrackWithAudioFeature[]) => void;
}

const SelectedSongsContext = createContext<
  SelectedSongsContextProps | undefined
>(undefined);

export const SelectedSongsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [selectedSongs, setSelectedSongs] = useState<TrackWithAudioFeature[]>(
    [],
  );

  const toggleSong = (song: TrackWithAudioFeature) => {
    setSelectedSongs((prev) =>
      prev.some((p) => p.id === song.id)
        ? prev.filter((p) => p.id !== song.id)
        : [...prev, song],
    );
  };

  const selectSongs = (songs: TrackWithAudioFeature[]) => {
    const songIds = new Set(songs.map((song) => song.id));
    setSelectedSongs((prev) => [
      ...prev.filter((song) => !songIds.has(song.id)),
      ...songs,
    ]);
  };

  const clearSongs = (songs: TrackWithAudioFeature[]) => {
    const songIds = new Set(songs.map((song) => song.id));
    setSelectedSongs((prev) => prev.filter((song) => !songIds.has(song.id)));
  };

  return (
    <SelectedSongsContext.Provider
      value={{ selectedSongs, toggleSong, selectSongs, clearSongs }}
    >
      {children}
    </SelectedSongsContext.Provider>
  );
};

export const useSelectedSongs = () => {
  const context = useContext(SelectedSongsContext);
  if (!context) {
    throw new Error(
      'useSelectedSongs must be used within a SelectedSongsProvider',
    );
  }
  return context;
};
