import React, {useState, useEffect} from 'react';
import PlaylistDisplay from './PlaylistInputCard';
import { AuthSession, Playlist } from '../types/types';
import { getAllUserLikedPlaylists } from '../lib/actions';
import { Audio } from 'react-loader-spinner';


function PlaylistList({session}:{session:AuthSession}) {

  useEffect(() => {
    async function getUserPlaylists() {
      const userPlaylists = (await getAllUserLikedPlaylists(session).then(
        (data) => data.sort((a, b) => a.name.localeCompare(b.name))
      )) as Playlist[];
      setPlaylists(userPlaylists);
      setLoading(false);
    }
    getUserPlaylists();
  }, [session])

  const [loading, setLoading] = useState(true);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  return (
    <>
      {loading && (
        <div className="flex flex-col justify-center items-center w-full h-full">
          <Audio color="#1DB954" height={80} width={80} />
          <p className='font-bold text-2xl text-gray-400'>Loading your playlists...</p>
        </div>
      
      )}
      {!loading && (
        <div className="grid grid-cols-[repeat(auto-fit,_minmax(7.5rem,_1fr))] gap-4 w-full">
          {playlists.map((playlist) => (
            <PlaylistDisplay
              key={playlist.id}
              playlist={playlist}
            />
          ))}
        </div>
      )}
      </>
  );
};

export default PlaylistList;
