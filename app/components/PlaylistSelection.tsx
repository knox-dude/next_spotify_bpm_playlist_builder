import React from 'react';
import PlaylistList from './PlaylistInputCardList';
import { AuthSession } from '../types/types';

interface PlaylistSelectionProps {
  session: AuthSession;
}

const PlaylistSelection: React.FC<PlaylistSelectionProps> = ({ session }) => (
  <>
    <div className="self-center flex justify-around w-11/12 text-gray-400 font-bold text-2xl mb-2">
      <p> Choose (click) playlists to use for the BPM song scan </p>
    </div>
    <PlaylistList session={session} />
  </>
);

export default PlaylistSelection;
