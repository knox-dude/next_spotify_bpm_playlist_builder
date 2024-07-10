import React from 'react';
import PlaylistDisplay from './PlaylistDisplay';

const PlaylistList: React.FC = () => {
  const playlists = [
    { id: 1, name: 'Playlist 1asdfasdfasdfasdfasdfasdfasdf', imageUrl: '' },
    { id: 2, name: 'Playlist 2', imageUrl: '' },
    { id: 3, name: 'Playlist 3', imageUrl: '' },
    { id: 4, name: 'Playlist 4', imageUrl: '' },
    { id: 5, name: 'Playlist 5', imageUrl: '' },
    { id: 6, name: 'Playlist 6', imageUrl: '' },
    // Add more playlists here
  ];

  return (
    <div className="grid grid-cols-[repeat(auto-fit,_minmax(7.5rem,_1fr))] gap-4 w-full">
      {playlists.map((playlist) => (
        <PlaylistDisplay
          key={playlist.id}
          name={playlist.name}
          imageUrl={playlist.imageUrl}
        />
      ))}
    </div>
  );
};

export default PlaylistList;
