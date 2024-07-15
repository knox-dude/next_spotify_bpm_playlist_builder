import React, { useState, useEffect } from 'react';
import PlaylistInputCard from './PlaylistInputCard';
import SearchBar from './DebouncedSearchBar';
import { AuthSession, Playlist } from '../types/types';
import { getAllUserLikedPlaylists } from '../lib/actions';
import { Audio } from 'react-loader-spinner';
import { useSelectedPlaylists } from '../providers/SelectedPlaylistsProvider';

function PlaylistInputCardList({ session }: { session: AuthSession }) {
  const [searchResults, setSearchResults] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const { selectedPlaylists, togglePlaylist, selectAllPlaylists, clearAllPlaylists } = useSelectedPlaylists();

  useEffect(() => {
    async function getUserPlaylists() {
      const userPlaylists = (await getAllUserLikedPlaylists(session).then(
        (data) => data.sort((a, b) => a.name.localeCompare(b.name))
      )) as Playlist[];
      setPlaylists(userPlaylists);
      setLoading(false);
    }
    getUserPlaylists();
  }, [session]);

  const renderPlaylists = (searchResults: string) => {
    if (!searchResults) {
      return playlists;
    }
    const searchResultsLower = searchResults.toLowerCase();
    return playlists.filter((playlist) =>
      playlist.name.toLowerCase().includes(searchResultsLower)
    );
  };

  return (
    <>
      {loading && (
        <div className="flex flex-col justify-center items-center w-full h-full">
          <Audio color="#1DB954" height={80} width={80} />
          <p className='font-bold text-2xl text-gray-400'>Loading your playlists...</p>
        </div>
      )}
      {!loading && (
        <>
          <div className=' flex justify-center gap-4 mb-4'>
            <SearchBar placeholder='Search for playlist' searchValue={searchResults} setSearchValue={setSearchResults} />
            <button type="button" onClick={() => selectAllPlaylists(playlists)} className="bg-paper-500 text-white rounded-md p-2 enabled:hover:bg-paper-600">Select All</button>
            <button type="button" onClick={() => clearAllPlaylists()} className="bg-paper-500 text-white rounded-md p-2 enabled:hover:bg-paper-600">Select None</button>
          </div>
          <div className="flex flex-col justify-center w-full">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-4 w-full">
              {renderPlaylists(searchResults).map((playlist) => (
                <PlaylistInputCard
                  key={playlist.id}
                  playlist={playlist}
                  selected={selectedPlaylists.some((p) => p.id === playlist.id)}
                  togglePlaylist={togglePlaylist}
                />
              ))}
            </div>
            {renderPlaylists(searchResults).length === 0 && (
                <div className="flex flex-col justify-center items-center w-full h-full">
                  <p className="font-bold text-2xl text-gray-400">No playlists found</p>
                </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default PlaylistInputCardList;
