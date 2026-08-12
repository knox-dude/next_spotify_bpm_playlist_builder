import { TrackWithAudioFeature } from '../types/updatedTypes';
import { useSelectedSongs } from '../providers/SelectedSongsProvider';
import Image from 'next/image';
import { Album } from 'lucide-react';
import { FaCheckSquare } from 'react-icons/fa';
import { FaSquare } from 'react-icons/fa';

interface ResultSongProps {
  track: TrackWithAudioFeature;
}

function ResultSong({ track }: ResultSongProps) {
  const { selectedSongs, toggleSong } = useSelectedSongs();
  const isSelected = selectedSongs.some((p) => p.id === track.id);

  return (
    <div
      className="flex w-full cursor-pointer items-center gap-2 sm:gap-4"
      onClick={() => toggleSong(track)}
    >
      {track.album?.images && track.album.images.length > 0 ? (
        <Image
          src={track.album.images[0].url}
          alt=""
          width={72}
          height={72}
          className="aspect-square h-12 w-12 shrink-0 rounded-l-md object-cover sm:h-[72px] sm:w-[72px]"
        />
      ) : (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center sm:h-[72px] sm:w-[72px]">
          <Album size={20} />
        </span>
      )}

      {/* min-w-0 lets the title truncate instead of pushing the BPM off-screen. */}
      <h3 className="min-w-0 flex-1 truncate text-left text-sm font-semibold sm:text-base">
        {track.name}
      </h3>

      <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary sm:text-sm">
        {Math.round(track.analysis.tempo)} BPM
      </span>

      {isSelected ? (
        <FaCheckSquare className="h-7 w-7 shrink-0 sm:h-[50px] sm:w-[50px]" />
      ) : (
        <FaSquare className="h-7 w-7 shrink-0 sm:h-[50px] sm:w-[50px]" />
      )}
    </div>
  );
}

export default ResultSong;
