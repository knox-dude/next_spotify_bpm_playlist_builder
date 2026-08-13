'use client';

import React, { useState } from 'react';
import { AuthSession } from '../types/types';
import { Playlist } from '../types/updatedTypes';
import { useSelectedPlaylists } from '../providers/SelectedPlaylistsProvider';
import TempoRangeCard from './TempoRangeCard';
import SourcesCard from './SourcesCard';
import GenerateButton from './GenerateButton';

interface handleBpmGenerationProps {
  lowBpm: string;
  highBpm: string;
  doubleSpeed: boolean;
  halfSpeed: boolean;
  shortTerm: boolean;
  mediumTerm: boolean;
  longTerm: boolean;
  selectedPlaylists: Playlist[];
}

interface BpmSubmitFormProps {
  session: AuthSession;
  handleBpmGeneration: ({
    lowBpm,
    highBpm,
    doubleSpeed,
    halfSpeed,
    shortTerm,
    mediumTerm,
    longTerm,
    selectedPlaylists,
  }: handleBpmGenerationProps) => void;
}

const BpmSubmitForm: React.FC<BpmSubmitFormProps> = ({
  session,
  handleBpmGeneration,
}) => {
  const [lowBpm, setLowBpm] = useState<string>('');
  const [highBpm, setHighBpm] = useState<string>('');
  const [doubleSpeed, setDoubleSpeed] = useState<boolean>(false);
  const [halfSpeed, setHalfSpeed] = useState<boolean>(false);
  const [shortTerm, setShortTerm] = useState<boolean>(false);
  const [mediumTerm, setMediumTerm] = useState<boolean>(false);
  const [longTerm, setLongTerm] = useState<boolean>(false);

  const { selectedPlaylists } = useSelectedPlaylists();

  const handleBpmInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === 'lowBpm') {
      setLowBpm(value);
    } else if (name === 'highBpm') {
      setHighBpm(value);
    }
  };

  const setRange = (low: string, high: string) => {
    setLowBpm(low);
    setHighBpm(high);
  };

  /** Everything standing between the user and a scan, in plain words. */
  const blockers = (): string[] => {
    const reasons: string[] = [];
    const lowParsed = parseInt(lowBpm);
    const highParsed = parseInt(highBpm);

    if (isNaN(lowParsed) || isNaN(highParsed) || lowParsed <= 0 || highParsed <= 0) {
      reasons.push('Enter a lower and upper BPM.');
    } else if (lowParsed > highParsed) {
      reasons.push('The lower BPM has to be below the upper one.');
    }
    if (!shortTerm && !mediumTerm && !longTerm && selectedPlaylists.length === 0) {
      reasons.push('Pick at least one playlist or a set of top songs.');
    }

    return reasons;
  };

  const reasons = blockers();
  const canSubmit = reasons.length === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) {
      handleBpmGeneration({
        lowBpm,
        highBpm,
        doubleSpeed,
        halfSpeed,
        shortTerm,
        mediumTerm,
        longTerm,
        selectedPlaylists,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Build a playlist at your tempo
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-400 sm:text-base">
          Set a BPM range, choose what to search, and every song in your library
          that keeps that pace comes back in one list.
        </p>
      </header>

      <TempoRangeCard
        lowBpm={lowBpm}
        highBpm={highBpm}
        handleBpmInputChange={handleBpmInputChange}
        setRange={setRange}
        doubleSpeed={doubleSpeed}
        setDoubleSpeed={setDoubleSpeed}
        halfSpeed={halfSpeed}
        setHalfSpeed={setHalfSpeed}
      />

      <SourcesCard
        session={session}
        shortTerm={shortTerm}
        setShortTerm={setShortTerm}
        mediumTerm={mediumTerm}
        setMediumTerm={setMediumTerm}
        longTerm={longTerm}
        setLongTerm={setLongTerm}
      />

      <GenerateButton disabled={!canSubmit} reasons={reasons} />
    </form>
  );
};

export default BpmSubmitForm;
