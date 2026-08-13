import { TrackWithAudioFeature } from '../types/updatedTypes';
import { useSelectedSongs } from '../providers/SelectedSongsProvider';
import Image from 'next/image';
import { Album, Check } from 'lucide-react';

interface ResultSongProps {
  track: TrackWithAudioFeature;
}

function ResultSong({ track }: ResultSongProps) {
  const { selectedSongs, toggleSong } = useSelectedSongs();
  const isSelected = selectedSongs.some((p) => p.id === track.id);
  const artists = track.artists?.map((artist) => artist.name).join(', ');

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={() => toggleSong(track)}
      className={`flex w-full items-center gap-3 rounded-xl border px-2 py-2 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
        isSelected
          ? 'border-primary/40 bg-primary/10'
          : 'border-transparent hover:bg-white/5'
      }`}
    >
      {track.album?.images && track.album.images.length > 0 ? (
        <Image
          src={track.album.images[0].url}
          alt=""
          width={80}
          height={80}
          className="aspect-square h-11 w-11 shrink-0 rounded-md object-cover sm:h-12 sm:w-12"
        />
      ) : (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-paper-500 text-gray-dark sm:h-12 sm:w-12">
          <Album size={18} />
        </span>
      )}

      {/* min-w-0 lets the title truncate instead of pushing the BPM off-screen. */}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-white">
          {track.name}
        </span>
        <span className="block truncate text-xs text-gray-500">{artists}</span>
      </span>

      <span className="shrink-0 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-bold text-primary">
        {Math.round(track.analysis.tempo)}
        <span className="hidden sm:inline"> BPM</span>
      </span>

      <span
        aria-hidden="true"
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
          isSelected
            ? 'border-primary bg-primary text-black'
            : 'border-white/20 text-transparent'
        }`}
      >
        <Check size={14} strokeWidth={3} />
      </span>
    </button>
  );
}

export default ResultSong;
