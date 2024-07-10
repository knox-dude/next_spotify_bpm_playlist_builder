import React, { useState } from 'react';
import Image from 'next/image';

interface PlaylistDisplayProps {
  name: string;
  imageUrl: string;
}

const PlaylistDisplay: React.FC<PlaylistDisplayProps> = ({ name, imageUrl }) => {
  const [selected, setSelected] = useState(false);

  const handleClick = () => {
    setSelected(!selected);
  };

  return (
    <div
      className={`flex flex-col items-center justify-between w-30 h-30 bg-gray-200 rounded-md cursor-pointer transition-colors duration-300 p-2 ${
        selected ? 'bg-gray-400' : 'bg-gray-200'
      }`}
      onClick={handleClick}
    >
      <Image
        src={imageUrl}
        alt={name}
        className="w-full h-24 object-cover rounded-md transition-opacity duration-300"
        width={120}
        height={120}
      />
      <p className="mt-2 text-base font-bold truncate w-full text-center">
        {name}
      </p>
    </div>
  );
};

export default PlaylistDisplay;
