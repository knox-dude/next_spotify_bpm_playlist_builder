import React, { useState } from 'react';
import Image from 'next/image';
import { Playlist } from '../types/updatedTypes';
import { MdOutlineCheckCircle } from 'react-icons/md';
import { Album } from 'lucide-react';

interface PlaylistInputCardProps {
  playlist: Playlist;
  selected: boolean;
  togglePlaylist: (playlist: Playlist) => void;
}

const PlaylistInputCard: React.FC<PlaylistInputCardProps> = ({
  playlist,
  selected,
  togglePlaylist,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    togglePlaylist(playlist);
  };

  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={playlist.name}
      className={`relative flex w-full cursor-pointer flex-col items-center justify-between rounded-md p-2 transition-colors duration-300 ${
        selected ? 'bg-gray-400' : 'bg-gray-200'
      }`}
      onClick={handleClick}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
    >
      {playlist.images && playlist.images.length > 0 ? (
        <Image
          src={playlist.images[0].url}
          alt=""
          className="aspect-square w-full rounded-md object-cover transition-opacity duration-300"
          width={120}
          height={120}
        />
      ) : (
        <span className="flex aspect-square w-full items-center justify-center rounded-md bg-paper-500">
          <Album size={20} />
        </span>
      )}

      <p className="mt-2 w-full truncate text-center text-xs font-bold text-paper-400 sm:text-base">
        {playlist.name}
      </p>

      {/* Hover label, for names too long to fit the tile. Desktop only -
          touch devices never hover, and the name is already shown above. */}
      {isHovered && (
        <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-64 -translate-x-1/2 translate-y-8 transform rounded-md bg-gray-700 py-1 text-center text-sm text-white opacity-90 sm:block">
          {playlist.name}
        </span>
      )}

      {selected && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-green-600">
          <MdOutlineCheckCircle className="h-1/2 w-1/2" />
        </span>
      )}
    </button>
  );
};

export default PlaylistInputCard;
