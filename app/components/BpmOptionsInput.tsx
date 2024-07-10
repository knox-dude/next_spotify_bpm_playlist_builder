"use client";

import React, { useState } from 'react';


interface BpmOptionsInputProps {
  onInputChange: (lowBpm: number, highBpm: number) => void;
}

const BpmOptionsInput: React.FC<BpmOptionsInputProps> = ({ onInputChange }) => {
  const [lowBpm, setLowBpm] = useState<number>(0);
  const [highBpm, setHighBpm] = useState<number>(0);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const parsedValue = parseInt(value);

    if (!isNaN(parsedValue)) {
      if (name === 'lowBpm') {
        setLowBpm(parsedValue);
      } else if (name === 'highBpm') {
        setHighBpm(parsedValue);
      }
    }
  };

  React.useEffect(() => {
    onInputChange(lowBpm, highBpm);
  }, [lowBpm, highBpm, onInputChange]);

  return (
    <div className='flex self-center justify-around'>
      <label htmlFor="lowBpm">Low BPM:</label>
      <input
        type="text"
        id="lowBpm"
        name="lowBpm"
        value={lowBpm}
        onChange={handleInputChange}
      />

      <label htmlFor="highBpm">High BPM:</label>
      <input
        type="text"
        id="highBpm"
        name="highBpm"
        value={highBpm}
        onChange={handleInputChange}
      />
    </div>
  );
};

export default BpmOptionsInput;