'use client';
import React, { useState } from 'react';
import { SelectedPlaylistsProvider } from '../providers/SelectedPlaylistsProvider';
import BpmSubmitForm from './BpmSubmitForm';
import { AuthSession } from '../types/types';
import { Playlist, TrackWithAudioFeature } from '../types/updatedTypes';
import { Audio } from 'react-loader-spinner';
import ResultPlaylist from './ResultPlaylist';
import { SelectedSongsProvider } from '../providers/SelectedSongsProvider';
import SaveSongsButton from './SaveSongsButton';
import TextInput from './TextInput';
import useCreatePlaylist from '../hooks/useCreatePlaylist';
import useGenerateBpmSongs from '../hooks/useGenerateBpmSongs';
import SignoutButton from './SignoutButton';

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
    results,
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
      console.log('Playlist created:', newPlaylistId);
      if (newWindow) {
        newWindow.location.href = `https://open.spotify.com/playlist/${newPlaylistId}`;
      }
      // Handle post-creation logic, e.g., reset state, show a success message, etc.
    } catch (error) {
      console.error('Error creating playlist:', error);
      alert(`Error creating playlist: ${error}`);
      if (newWindow) {
        newWindow.close();
      }
    }
  };

  return (
    <SelectedPlaylistsProvider>
      <SignoutButton />
      {!generateLoading && !completed && (
        <BpmSubmitForm
          session={session}
          handleBpmGeneration={handleBpmGeneration}
        />
      )}
      {generateLoading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-75">
          <Audio color="#1DB954" height={80} width={80} />
          <p className="font-bold text-2xl text-gray-400">
            Please sit back and relax, this could take a while...
          </p>
        </div>
      )}
      <SelectedSongsProvider>
        {!generateLoading && completed && (
          <div className="w-11/12 self-center">
            <div className="flex flex-col gap-4 justify-center m-2 w-100vw">
              <button
                type="button"
                onClick={() => {
                  setCompleted(false);
                }}
                className="w-1/3 self-center bg-paper-500 mb-4 text-white rounded-md p-2 disabled:cursor-not-allowed disabled:opacity-30 enabled:hover:bg-paper-600"
              >
                Back to Playlist Builder
              </button>
            </div>

            <div className="flex items-center align-middle w-11/12 justify-center text-center">
              <div className="h-[60vh] overflow-auto w-full align-middle">
                {Array.from(results.entries()).some(
                  ([_, tracks]) => tracks.length > 0,
                ) ? (
                  Array.from(results.entries()).map(
                    ([playlist, tracks]) =>
                      tracks.length > 0 && (
                        <ResultPlaylist
                          playlist={playlist}
                          tracks={tracks}
                          key={playlist.id}
                        />
                      ),
                  )
                ) : (
                  <p className="text-3xl font-bold self-center">
                    No tracks found with chosen BPM :(
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 justify-center m-2 w-100vw">
              <TextInput
                className={'self-center w-1/3'}
                label="playlist-name"
                value={newPlaylistName}
                placeholder={'playlist name'}
                onChange={(e) => setNewPlaylistName(e.target.value)}
              />
              <SaveSongsButton onClick={saveSongsToPlaylist} />
            </div>
          </div>
        )}
      </SelectedSongsProvider>
    </SelectedPlaylistsProvider>
  );
}

export default BpmFormHolder;
