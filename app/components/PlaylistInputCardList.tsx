import React, { useState, useEffect } from 'react';
import PlaylistInputCard from './PlaylistInputCard';
import SearchBar from './DebouncedSearchBar';
import { AuthSession } from '../types/types';
import { Playlist } from '@/app/types/updatedTypes';
import { getAllUserLikedPlaylists } from '../lib/actions';
import { LIKED_SONGS_ID } from '../lib/generateBpmSongs';
import { Audio } from 'react-loader-spinner';
import { useSelectedPlaylists } from '../providers/SelectedPlaylistsProvider';
import { GHOST_BUTTON } from './ui/styles';

/**
 * Liked Songs isn't a real playlist in Spotify's API, so it's presented as one
 * here and swapped for the /me/tracks endpoint when the scan runs.
 */
const LIKED_SONGS_PLAYLIST = {
  id: LIKED_SONGS_ID,
  name: 'Liked Songs',
  images: [{ url: '/images/liked_cover.jpeg', height: null, width: null }],
  tracks: { href: '', total: 0 },
} as unknown as Playlist;

function PlaylistInputCardList({ session }: { session: AuthSession }) {
  const [searchResults, setSearchResults] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const {
    selectedPlaylists,
    togglePlaylist,
    selectAllPlaylists,
    clearAllPlaylists,
  } = useSelectedPlaylists();

  useEffect(() => {
    let cancelled = false;

    async function getUserPlaylists() {
      try {
        const userPlaylists = (await getAllUserLikedPlaylists(session)) ?? [];
        if (cancelled) {
          return;
        }
        const sorted = [...userPlaylists].sort((a, b) =>
          a.name.localeCompare(b.name),
        ) as Playlist[];
        // Liked Songs first - it's the one nearly everybody wants to scan.
        setPlaylists([LIKED_SONGS_PLAYLIST, ...sorted]);
      } catch (err) {
        if (!cancelled) {
          setError(`Could not load your playlists: ${err}`);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    getUserPlaylists();
    return () => {
      cancelled = true;
    };
  }, [session]);

  const renderPlaylists = (searchResults: string) => {
    if (!searchResults) {
      return playlists;
    }
    const searchResultsLower = searchResults.toLowerCase();
    return playlists.filter((playlist) =>
      playlist.name.toLowerCase().includes(searchResultsLower),
    );
  };

  const visible = renderPlaylists(searchResults);
  const selectedCount = selectedPlaylists.length;

  return (
    <>
      {loading && (
        <div className="flex w-full flex-col items-center justify-center gap-3 py-10">
          <Audio color="#1DB954" height={56} width={56} />
          <p className="text-sm font-semibold text-gray-400">
            Loading your playlists...
          </p>
        </div>
      )}
      {!loading && error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
          <p className="text-sm font-semibold text-red-400">{error}</p>
        </div>
      )}
      {!loading && !error && (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="min-w-0 flex-1 basis-full sm:basis-64">
              <SearchBar
                placeholder="Search for playlist"
                searchValue={searchResults}
                setSearchValue={setSearchResults}
              />
            </div>
            <button
              type="button"
              onClick={() => selectAllPlaylists(playlists)}
              className={GHOST_BUTTON}
            >
              Select All
            </button>
            <button
              type="button"
              onClick={() => clearAllPlaylists()}
              className={GHOST_BUTTON}
            >
              Select None
            </button>
            <span
              aria-live="polite"
              className="ml-auto text-xs font-semibold text-gray-500"
            >
              {selectedCount} selected
            </span>
          </div>

          <div className="max-h-[46vh] overflow-y-auto pr-1 sm:max-h-[42vh]">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-3 sm:grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] sm:gap-4">
              {visible.map((playlist) => (
                <PlaylistInputCard
                  key={playlist.id}
                  playlist={playlist}
                  selected={selectedPlaylists.some(
                    (p) => p.id === playlist.id,
                  )}
                  togglePlaylist={togglePlaylist}
                />
              ))}
            </div>
            {visible.length === 0 && (
              <div className="flex w-full flex-col items-center justify-center py-10">
                <p className="text-sm font-semibold text-gray-400">
                  No playlists found
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default PlaylistInputCardList;
