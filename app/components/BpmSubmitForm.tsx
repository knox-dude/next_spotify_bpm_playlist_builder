"use client";

import React, { useState } from "react";
import { AuthSession } from "../types/types";
import TextInput from "./TextInput";
import Checkbox from "./Checkbox";
import generateBpmSongs from "../lib/generateBpmSongs";
import PlaylistList from "./PlaylistList";

interface BpmSubmitFormProps {
  session: AuthSession;
}

const BpmSubmitForm: React.FC<BpmSubmitFormProps> = ({ session }) => {
  const [lowBpm, setLowBpm] = useState<string>("");
  const [highBpm, setHighBpm] = useState<string>("");
  const [doubleSpeed, setDoubleSpeed] = useState<boolean>(false);
  const [halfSpeed, setHalfSpeed] = useState<boolean>(false);
  const [shortTerm, setShortTerm] = useState<boolean>(false);
  const [mediumTerm, setMediumTerm] = useState<boolean>(false);
  const [longTerm, setLongTerm] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit()) {
      generateBpmSongs(
        parseInt(lowBpm),
        parseInt(highBpm),
        doubleSpeed,
        halfSpeed,
        shortTerm,
        mediumTerm,
        longTerm,
        session
      );
    }
  };

  const handleBpmInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === "lowBpm") {
      setLowBpm(value);
    } else if (name === "highBpm") {
      setHighBpm(value);
    }
  };

  const canSubmit = (): boolean => {
    const lowParsed = parseInt(lowBpm);
    const highParsed = parseInt(highBpm);
    if (isNaN(lowParsed) || isNaN(highParsed)) {
      return false;
    }
    return lowParsed > 0 && highParsed > 0 && lowParsed <= highParsed;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="self-center flex flex-col w-11/12 justify-center items-center"
    >
      <div className="self-center flex justify-around w-11/12 text-gray-400">
        <p>Choose BPM range </p>
      </div>
      <TextInput
        label="lowBpm"
        value={lowBpm}
        placeholder=" Enter lower BPM"
        onChange={(e) => handleBpmInputChange(e)}
      />
      <TextInput
        label="highBpm"
        value={highBpm}
        placeholder=" Enter higher BPM"
        onChange={(e) => handleBpmInputChange(e)}
      />
      <hr className="h-px w-full my-2 bg-gray-500 border-0 z-10"></hr>
      <div className="self-center flex justify-around w-11/12 text-gray-400">
        <p>Choose options </p>
      </div>
      <Checkbox
        label="double speed"
        checked={doubleSpeed}
        hint="Include songs that are double the desired BPM range."
        onChange={(e) => setDoubleSpeed(e.target.checked)}
      />
      <Checkbox
        label="half speed"
        checked={halfSpeed}
        hint="Include songs that are half the desired BPM range."
        onChange={(e) => setHalfSpeed(e.target.checked)}
      />
      <Checkbox
        label="top songs - short term"
        checked={shortTerm}
        hint="Include your top songs from the last 4 weeks."
        onChange={(e) => setShortTerm(e.target.checked)}
      />
      <Checkbox
        label="top songs - medium term"
        checked={mediumTerm}
        hint="Include your top songs from the last 6 months."
        onChange={(e) => setMediumTerm(e.target.checked)}
      />
      <Checkbox
        label="top songs - long term"
        checked={longTerm}
        hint="Include your top songs of all time."
        onChange={(e) => setLongTerm(e.target.checked)}
      />
      <hr className="h-px w-full my-2 bg-gray-500 border-0 z-10"></hr>
      <div className="self-center flex justify-around w-11/12 text-gray-400">
        <p> Choose playlists </p>
      </div>
      <PlaylistList />
      <div
        className="relative"
        onMouseOver={() => setIsHovered(true)}
        onMouseOut={() => setIsHovered(false)}
      >
        <button
          type="submit"
          className="bg-paper-500 mb-4 text-white rounded-md p-2 disabled:cursor-not-allowed disabled:opacity-30 enabled:hover:bg-paper-600"
          disabled={!canSubmit()}
        >
          Generate BPM
        </button>
        {!canSubmit() && isHovered && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-700 text-white text-center text-sm rounded-md py-1 opacity-90">
            -both bpm inputs must be numbers<br />
            -lower bpm must be lower than or equal to higher bpm
          </div>
        )}
      </div>
    </form>
  );
};

export default BpmSubmitForm;
