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
      prev.some((p) => p.track.id === song.track.id)
        ? prev.filter((p) => p.track.id !== song.track.id)
        : [...prev, song],
    );
  };

  const selectSongs = (songs: TrackWithAudioFeature[]) => {
    const songIds = new Set(songs.map((song) => song.track.id));
    setSelectedSongs((prev) => [
      ...prev.filter((song) => !songIds.has(song.track.id)),
      ...songs,
    ]);
  };

  const clearSongs = (songs: TrackWithAudioFeature[]) => {
    const songIds = new Set(songs.map((song) => song.track.id));
    setSelectedSongs((prev) =>
      prev.filter((song) => !songIds.has(song.track.id)),
    );
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
