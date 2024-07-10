"use client";

import React, { useState } from 'react';
import { AuthSession } from "../types/types";
import TextInput from './TextInput';
import Checkbox from './Checkbox';
import generateBpmSongs from "../lib/generateBpmSongs";

interface BpmSubmitFormProps {
  session: AuthSession;
}

const BpmSubmitForm: React.FC<BpmSubmitFormProps> = ({session}: {session:AuthSession}) => {
  const [lowBpm, setLowBpm] = useState<number>(0);
  const [highBpm, setHighBpm] = useState<number>(0);
  const [doubleSpeed, setDoubleSpeed] = useState<boolean>(false);
  const [halfSpeed, setHalfSpeed] = useState<boolean>(false);
  const [shortTerm, setShortTerm] = useState<boolean>(false);
  const [mediumTerm, setMediumTerm] = useState<boolean>(false);
  const [longTerm, setLongTerm] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  const handleBpmInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const parsedValue = parseInt(value);

    if (!isNaN(parsedValue)) {
      if (name === 'lowBpm') {
        setLowBpm(parsedValue);
      } else if (name === 'highBpm') {
        setHighBpm(parsedValue);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col'>
      <div className='flex justify-between'>
        <TextInput label="lowBpm" value={`${lowBpm}`} onChange={(e) => handleBpmInputChange(e)} />
        <TextInput label="highBpm" value={`${highBpm}`} onChange={(e) => handleBpmInputChange(e)} />
      </div>
      <div className='flex justify-between'>
        <Checkbox label="doubleSpeed" checked={doubleSpeed} onChange={(e) => setDoubleSpeed(e.target.checked)} />
        <Checkbox label="halfSpeed" checked={halfSpeed} onChange={(e) => setHalfSpeed(e.target.checked)} />
      </div>
      <div className='flex justify-between'>
        <Checkbox label="shortTerm" checked={shortTerm} onChange={(e) => setShortTerm(e.target.checked)} />
        <Checkbox label="mediumTerm" checked={mediumTerm} onChange={(e) => setMediumTerm(e.target.checked)} />
        <Checkbox label="longTerm" checked={longTerm} onChange={(e) => setLongTerm(e.target.checked)} />
      </div>
      <button className="bg-paper-500 mb-4 text-white rounded-md p-2 hover:bg-paper-600 self-center" onClick={() => generateBpmSongs(lowBpm, highBpm, doubleSpeed, halfSpeed, shortTerm, mediumTerm, longTerm, session)}>
        Generate BPM
      </button>
    </form>
  );
};


export default BpmSubmitForm;