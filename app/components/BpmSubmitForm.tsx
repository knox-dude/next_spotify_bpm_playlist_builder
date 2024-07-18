'use client';

import React, { useState } from 'react';
import { AuthSession, Playlist } from '../types/types';
import { useSelectedPlaylists } from '../providers/SelectedPlaylistsProvider';
import BpmInputSection from './BpmInputSection';
import OptionCheckboxes from './OptionCheckboxes';
import PlaylistSelection from './PlaylistSelection';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit()) {
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

  const handleBpmInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === 'lowBpm') {
      setLowBpm(value);
    } else if (name === 'highBpm') {
      setHighBpm(value);
    }
  };

  const canSubmit = (): boolean => {
    const lowParsed = parseInt(lowBpm);
    const highParsed = parseInt(highBpm);
    if (isNaN(lowParsed) || isNaN(highParsed)) {
      return false;
    }
    if (!shortTerm && !mediumTerm && !longTerm) {
      if (selectedPlaylists.length === 0) {
        return false;
      }
    }
    return lowParsed > 0 && highParsed > 0 && lowParsed <= highParsed;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="self-center flex flex-col w-11/12 justify-center items-center"
    >
      <div className="self-center flex justify-around w-11/12 text-gray-400 font-bold text-2xl">
        <p>Choose BPM range </p>
      </div>
      <BpmInputSection
        lowBpm={lowBpm}
        highBpm={highBpm}
        handleBpmInputChange={handleBpmInputChange}
      />
      <hr className="h-px w-full my-2 bg-gray-500 border-0 z-10"></hr>
      <div className="self-center flex justify-around w-11/12 text-gray-400 font-bold text-2xl">
        <p>Choose options </p>
      </div>
      <OptionCheckboxes
        doubleSpeed={doubleSpeed}
        setDoubleSpeed={setDoubleSpeed}
        halfSpeed={halfSpeed}
        setHalfSpeed={setHalfSpeed}
        shortTerm={shortTerm}
        setShortTerm={setShortTerm}
        mediumTerm={mediumTerm}
        setMediumTerm={setMediumTerm}
        longTerm={longTerm}
        setLongTerm={setLongTerm}
      />
      <hr className="h-px w-full my-2 bg-gray-500 border-0 z-10"></hr>
      <PlaylistSelection session={session} />
      <GenerateButton canSubmit={canSubmit} />
    </form>
  );
};

export default BpmSubmitForm;
