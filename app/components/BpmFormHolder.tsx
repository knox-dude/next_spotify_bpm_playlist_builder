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
import { signOut } from 'next-auth/react';

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

  const handleSignOut = async () => {
    try {
      // Clear session cookies for full logout - redirect to login page afterwards
      signOut({ callbackUrl: '/login' });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

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
      <button
        className="self-center rounded bg-paper-500 px-4 py-2 text-sm font-bold text-white hover:bg-paper-600 sm:text-base"
        onClick={handleSignOut}
      >
        Sign out
      </button>
      {!generateLoading && !completed && (
        <BpmSubmitForm
          session={session}
          handleBpmGeneration={handleBpmGeneration}
        />
      )}
      {generateLoading && (
        <div className="fixed inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-gray-800 bg-opacity-75 px-6 text-center">
          <Audio color="#1DB954" height={80} width={80} />
          <p className="text-lg font-bold text-gray-400 sm:text-2xl">
            Please sit back and relax, this could take a while...
          </p>
        </div>
      )}
      <SelectedSongsProvider>
        {!generateLoading && completed && (
          <div className="w-full self-center">
            <div className="m-2 flex flex-col justify-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setCompleted(false);
                }}
                className="mb-4 w-full self-center rounded-md bg-paper-500 p-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-30 enabled:hover:bg-paper-600 sm:w-1/3 sm:text-base"
              >
                Back to Playlist Builder
              </button>
            </div>

            <div className="flex w-full items-center justify-center text-center align-middle">
              <div className="max-h-[60vh] w-full overflow-auto align-middle">
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

            <div className="m-2 flex flex-col justify-center gap-4">
              <TextInput
                className={'w-full self-center sm:w-1/3'}
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
