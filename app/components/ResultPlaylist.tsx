import { Playlist, TrackWithAudioFeature } from '../types/updatedTypes';
import { MouseEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import { Album } from 'lucide-react';
import { MdExpandLess } from 'react-icons/md';
import { MdExpandMore } from 'react-icons/md';
import { FaCheckSquare } from 'react-icons/fa';
import { FaSquare } from 'react-icons/fa';
import { useSelectedSongs } from '../providers/SelectedSongsProvider';
import ResultSong from './ResultSong';

interface ResultPlaylistProps {
  playlist: Playlist;
  tracks: TrackWithAudioFeature[];
}

function ResultPlaylist({ playlist, tracks }: ResultPlaylistProps) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [checked, setChecked] = useState<boolean>(false);
  const { selectedSongs, toggleSong, selectSongs, clearSongs } =
    useSelectedSongs();

  useEffect(() => {
    setChecked(
      tracks.every((track) =>
        selectedSongs.some((selectedTrack) => selectedTrack.id === track.id),
      ),
    );
  }, [selectedSongs, tracks]);

  function selectPlaylist(e: MouseEvent<SVGElement, globalThis.MouseEvent>) {
    e.stopPropagation();
    checked ? clearSongs(tracks) : selectSongs(tracks);
  }

  return (
    <div className="flex flex-col w-full mb-4">
      <div
        className="flex w-full cursor-pointer justify-between gap-2 rounded-md bg-paper-500 p-2"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div className="flex min-w-0 items-center justify-start gap-2">
          {playlist.images && playlist.images.length > 0 ? (
            <Image
              src={playlist.images[0].url}
              alt=""
              width={72}
              height={72}
              className="aspect-square h-12 w-12 shrink-0 rounded-md object-cover sm:h-[72px] sm:w-[72px]"
            />
          ) : (
            <Album className="h-12 w-12 shrink-0 sm:h-[72px] sm:w-[72px]" />
          )}
          <h2 className="min-w-0 truncate self-center text-base font-bold sm:text-lg">
            {playlist.name}
          </h2>
        </div>
        <div className="flex shrink-0 items-center justify-end">
          {checked ? (
            <FaCheckSquare
              aria-label="checkbox-checked"
              className="h-6 w-6 sm:h-[30px] sm:w-[30px]"
              onClick={(e) => selectPlaylist(e)}
            />
          ) : (
            <FaSquare
              aria-label="checkbox-unchecked"
              className="h-6 w-6 sm:h-[30px] sm:w-[30px]"
              onClick={(e) => selectPlaylist(e)}
            />
          )}
          {expanded ? (
            <MdExpandLess
              aria-label="expand-less"
              className="h-9 w-9 self-center sm:h-[50px] sm:w-[50px]"
            />
          ) : (
            <MdExpandMore
              aria-label="expand-more"
              className="h-9 w-9 self-center sm:h-[50px] sm:w-[50px]"
            />
          )}
        </div>
      </div>
      {expanded && (
        <div className="mt-2">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="flex items-center justify-between mb-2 pr-4 truncate rounded-md group/item bg-paper-600 hover:bg-paper-500"
            >
              <ResultSong track={track} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ResultPlaylist;
