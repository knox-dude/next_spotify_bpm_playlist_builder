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

  return (
    <div
      className="flex items-center gap-4 w-full"
      onClick={() => toggleSong(track)}
    >
      {track.album.images.length > 0 ? (
        <Image
          src={track.album.images[0].url}
          alt={track.name}
          width={72}
          height={72}
          className="object-cover h-full rounded-tl-md rounded-bl-md aspect-square"
        />
      ) : (
        <Album size={20} />
      )}
      <h3 className="font-semibold truncate w-full">{track.name}</h3>
      <h3 className="font-semibold truncate w-full">
        BPM: {Math.round(track.analysis.tempo)}
      </h3>
      {selectedSongs.some((p) => p.id === track.id) ? (
        <FaCheckSquare style={{ width: 50, height: 50 }} />
      ) : (
        <FaSquare style={{ width: 50, height: 50 }} />
      )}
    </div>
  );
}

export default ResultSong;
