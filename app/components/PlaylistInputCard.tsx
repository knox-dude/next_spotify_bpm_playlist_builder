import React from 'react';
import Image from 'next/image';
import { Playlist } from '../types/updatedTypes';
import { Album, Check } from 'lucide-react';

interface PlaylistInputCardProps {
  playlist: Playlist;
  selected: boolean;
  togglePlaylist: (playlist: Playlist) => void;
}

const PlaylistInputCard: React.FC<PlaylistInputCardProps> = ({
  playlist,
  selected,
  togglePlaylist,
}) => (
  <button
    type="button"
    aria-pressed={selected}
    aria-label={playlist.name}
    // The full name lives in `title` for the long ones the tile has to truncate.
    title={playlist.name}
    onClick={() => togglePlaylist(playlist)}
    className={`group relative flex w-full flex-col rounded-xl border p-2 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
      selected
        ? 'border-primary/70 bg-primary/10'
        : 'border-white/5 bg-paper-600/40 hover:border-white/20 hover:bg-paper-600/80'
    }`}
  >
    <span className="relative block overflow-hidden rounded-lg">
      {playlist.images && playlist.images.length > 0 ? (
        <Image
          src={playlist.images[0].url}
          alt=""
          className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
          width={160}
          height={160}
        />
      ) : (
        <span className="flex aspect-square w-full items-center justify-center bg-paper-500 text-gray-dark">
          <Album size={24} />
        </span>
      )}

      {/* Dim unselected art slightly so a selected tile reads at a glance. */}
      <span
        aria-hidden="true"
        className={`absolute inset-0 transition ${
          selected ? 'bg-black/35' : 'bg-black/0'
        }`}
      />

      {selected && (
        <span
          aria-hidden="true"
          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-black shadow-lg"
        >
          <Check size={14} strokeWidth={3} />
        </span>
      )}
    </span>

    <span
      className={`mt-2 w-full truncate text-xs font-semibold sm:text-sm ${
        selected ? 'text-white' : 'text-gray-300'
      }`}
    >
      {playlist.name}
    </span>
  </button>
);

export default PlaylistInputCard;
