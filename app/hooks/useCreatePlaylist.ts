import { useState } from 'react';
import { AuthSession, TrackWithAnalysis } from '../types/types';
import { createPlaylist, addSongsToPlaylist } from '../lib/actions';

const useCreatePlaylist = (session: AuthSession) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPlaylistAndAddTracks = async (playlistName: string, songs: TrackWithAnalysis[]) => {
    if (!playlistName) {
      throw new Error('Playlist name is required');
    }
    if (songs.length === 0) {
      throw new Error('At least one song is required to create a playlist');
    }

    setLoading(true);
    setError(null);

    try {
      const createResponse = await createPlaylist(session, playlistName);

      if (createResponse.error) {
        throw new Error(`Failed to create playlist - ${createResponse.error.status} - ${createResponse.error.message}`);
      }

      console.log(createResponse);

      const addResponse = await addSongsToPlaylist(session, createResponse.id, songs.map((song) => song.id));

      if (addResponse.error) {
        throw new Error(`Failed to add songs to playlist - ${createResponse.error.status} - ${createResponse.error.message}`);
      }

      return createResponse.id;
    } catch (error: any) {
      setError(error.message);
      alert(`error creating playlist - ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { createPlaylistAndAddTracks, loading, error };
};

export default useCreatePlaylist;
