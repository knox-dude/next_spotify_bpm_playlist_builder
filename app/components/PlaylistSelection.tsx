import React from 'react';
import PlaylistList from './PlaylistInputCardList';
import { AuthSession } from '../types/types';

interface PlaylistSelectionProps {
  session: AuthSession;
}

const PlaylistSelection: React.FC<PlaylistSelectionProps> = ({ session }) => (
  <>
    <div className="mb-2 flex w-full justify-center self-center text-center text-lg font-bold text-gray-400 sm:justify-around sm:text-2xl">
      <p> Choose (click) playlists to use for the BPM song scan </p>
    </div>
    <PlaylistList session={session} />
  </>
);

export default PlaylistSelection;
