import React from 'react';
import PlaylistInputCardList from './PlaylistInputCardList';
import ToggleChip from './ToggleChip';
import { AuthSession } from '../types/types';
import { CARD, SECTION_LABEL } from './ui/styles';

interface SourcesCardProps {
  session: AuthSession;
  shortTerm: boolean;
  setShortTerm: React.Dispatch<React.SetStateAction<boolean>>;
  mediumTerm: boolean;
  setMediumTerm: React.Dispatch<React.SetStateAction<boolean>>;
  longTerm: boolean;
  setLongTerm: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Everything the scan can read from, in one place.
 *
 * Top tracks used to sit under a separate "options" heading, which hid the fact
 * that they are just another source to scan alongside the playlists below them.
 */
const SourcesCard: React.FC<SourcesCardProps> = ({
  session,
  shortTerm,
  setShortTerm,
  mediumTerm,
  setMediumTerm,
  longTerm,
  setLongTerm,
}) => (
  <section className={`${CARD} p-5 sm:p-6`}>
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h2 className={SECTION_LABEL}>Sources to scan</h2>
      <span className="text-xs text-gray-500">pick as many as you like</span>
    </div>

    <div className="mt-4">
      <p className="mb-2 text-xs font-semibold text-gray-400">Your top songs</p>
      <div className="flex flex-wrap gap-2">
        <ToggleChip
          label="past month"
          checked={shortTerm}
          hint="Include your top songs from the last 4 weeks."
          onChange={(e) => setShortTerm(e.target.checked)}
        />
        <ToggleChip
          label="past six months"
          checked={mediumTerm}
          hint="Include your top songs from the last 6 months."
          onChange={(e) => setMediumTerm(e.target.checked)}
        />
        <ToggleChip
          label="all time"
          checked={longTerm}
          hint="Include your top songs of all time."
          onChange={(e) => setLongTerm(e.target.checked)}
        />
      </div>
    </div>

    <div className="mt-6 border-t border-white/5 pt-5">
      <p className="mb-3 text-xs font-semibold text-gray-400">
        Your playlists
      </p>
      <PlaylistInputCardList session={session} />
    </div>
  </section>
);

export default SourcesCard;
