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
    <div
      className={`relative flex flex-col items-center justify-between w-30 h-30 bg-gray-200 rounded-md cursor-pointer transition-colors duration-300 p-2 ${
        selected ? 'bg-gray-400' : 'bg-gray-200'
      }`}
      onClick={handleClick}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
    >
      {playlist.images && playlist.images.length > 0 ? (
        <Image
          src={playlist.images.length > 0 ? playlist.images[0].url : ''}
          alt={playlist.name}
          className="w-full h-28 object-cover rounded-md transition-opacity duration-300"
          width={120}
          height={120}
        />
      ) : (
        <Album size={20} />
      )}

      <p className="mt-2 text-base text-paper-400 font-bold truncate w-full text-center">
        {playlist.name}
      </p>
      {isHovered && (
        <div className="absolute bottom-full left-1/2 transform translate-y-8 -translate-x-1/2 mb-2 w-64 bg-gray-700 text-white text-center text-sm rounded-md py-1 opacity-90">
          {playlist.name}
        </div>
      )}
      {selected && (
        <div className="absolute text-green-600">
          <MdOutlineCheckCircle size={100} />
        </div>
      )}
    </div>
  );
};

export default PlaylistInputCard;
