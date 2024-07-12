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
  const { selectedPlaylists, togglePlaylist } = useSelectedPlaylists();

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
          <div>
            <SearchBar searchValue={searchResults} setSearchValue={setSearchResults} />
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,_minmax(7.5rem,_1fr))] gap-4 w-full">
            {renderPlaylists(searchResults).map((playlist) => (
              <PlaylistInputCard
                key={playlist.id}
                playlist={playlist}
                selected={selectedPlaylists.some((p) => p.id === playlist.id)}
                togglePlaylist={togglePlaylist}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default PlaylistInputCardList;
