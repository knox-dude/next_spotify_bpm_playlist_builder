'use client';
import React, { useState } from 'react';
import { SelectedPlaylistsProvider } from '../providers/SelectedPlaylistsProvider';
import BpmSubmitForm from './BpmSubmitForm';
import { AuthSession } from '../types/types';
import { Playlist, TrackWithAudioFeature } from '../types/updatedTypes';
import ScanProgressOverlay from './ScanProgressOverlay';
import ResultsView from './ResultsView';
import { SelectedSongsProvider } from '../providers/SelectedSongsProvider';
import useCreatePlaylist from '../hooks/useCreatePlaylist';
import useGenerateBpmSongs from '../hooks/useGenerateBpmSongs';

interface HandleBpmGenerationProps {
  lowBpm: string;
  highBpm: string;
  doubleSpeed: boolean;
  halfSpeed: boolean;
  shortTerm: boolean;
  mediumTerm: boolean;
  longTerm: boolean;
  selectedPlaylists: Playlist[];
}

interface BpmFormHolderProps {
  session: AuthSession;
}

function BpmFormHolder({ session }: BpmFormHolderProps) {
  const [newPlaylistName, setNewPlaylistName] = useState<string>('');

  const {
    createPlaylistAndAddTracks,
    loading: createLoading,
    error: createError,
  } = useCreatePlaylist(session);
  const {
    generateSongs,
    loading: generateLoading,
    progress,
    result,
    completed,
    error: generateError,
    setCompleted,
  } = useGenerateBpmSongs(session);

  const handleBpmGeneration = (params: HandleBpmGenerationProps) => {
    generateSongs(params);
  };

  const saveSongsToPlaylist = async (
    songs: TrackWithAudioFeature[],
    newWindow: Window | null,
  ) => {
    try {
      const newPlaylistId = await createPlaylistAndAddTracks(
        newPlaylistName,
        songs,
      );
      if (newWindow) {
        newWindow.location.href = `https://open.spotify.com/playlist/${newPlaylistId}`;
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      if (newWindow) {
        newWindow.close();
      }
    }
  };

  return (
    <SelectedPlaylistsProvider>
      {!generateLoading && !completed && (
        <>
          {generateError && (
            <p
              role="alert"
              className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center text-sm font-semibold text-red-400"
            >
              {generateError}
            </p>
          )}
          <BpmSubmitForm
            session={session}
            handleBpmGeneration={handleBpmGeneration}
          />
        </>
      )}

      {generateLoading && <ScanProgressOverlay progress={progress} />}

      <SelectedSongsProvider>
        {!generateLoading && completed && (
          <>
            {createError && (
              <p
                role="alert"
                className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center text-sm font-semibold text-red-400"
              >
                {createError}
              </p>
            )}
            <ResultsView
              result={result}
              onBack={() => setCompleted(false)}
              playlistName={newPlaylistName}
              setPlaylistName={setNewPlaylistName}
              onSave={saveSongsToPlaylist}
              saving={createLoading}
            />
          </>
        )}
      </SelectedSongsProvider>
    </SelectedPlaylistsProvider>
  );
}

export default BpmFormHolder;
