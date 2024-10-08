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
        className="flex w-full cursor-pointer bg-paper-500 p-2 rounded-md justify-between"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div className="flex justify-start gap-2 items-center">
          {playlist.images && playlist.images.length > 0 ? (
            <Image
              src={playlist.images[0].url}
              alt={playlist.name}
              width={72}
              height={72}
              className="object-cover h-full rounded-tl-md rounded-bl-md aspect-square"
            />
          ) : (
            <Album size={72} />
          )}
          <h2 className="font-bold text-lg self-center">{playlist.name}</h2>
        </div>
        <div className="flex justify-end items-center">
          {checked ? (
            <FaCheckSquare
              aria-label="checkbox-checked"
              style={{ width: 30, height: 30 }}
              onClick={(e) => selectPlaylist(e)}
            />
          ) : (
            <FaSquare
              aria-label="checkbox-unchecked"
              style={{ width: 30, height: 30 }}
              onClick={(e) => selectPlaylist(e)}
            />
          )}
          {expanded ? (
            <MdExpandLess
              aria-label="expand-less"
              className="self-center"
              style={{ width: 50, height: 50 }}
            />
          ) : (
            <MdExpandMore
              aria-label="expand-more"
              className="self-center"
              style={{ width: 50, height: 50 }}
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
