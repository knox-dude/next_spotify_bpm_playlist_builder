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
      const response = await createPlaylist(session, playlistName);

      if (!response.ok) {
        throw new Error('Failed to create playlist');
      }

      console.log(response);

      const result = await response.json();
      return result;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { createPlaylistAndAddTracks, loading, error };
};

export default useCreatePlaylist;
