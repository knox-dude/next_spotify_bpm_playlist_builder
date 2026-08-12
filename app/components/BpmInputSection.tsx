import React from 'react';
import TextInput from './TextInput';

interface BpmInputSectionProps {
  lowBpm: string;
  highBpm: string;
  handleBpmInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BpmInputSection: React.FC<BpmInputSectionProps> = ({
  lowBpm,
  highBpm,
  handleBpmInputChange,
}) => (
  <div className="flex w-full flex-col items-stretch sm:w-auto sm:flex-row sm:items-center">
    <TextInput
      label="lowBpm"
      value={lowBpm}
      placeholder="Enter lower BPM"
      onChange={handleBpmInputChange}
      inputMode="numeric"
    />
    <TextInput
      label="highBpm"
      value={highBpm}
      placeholder="Enter higher BPM"
      onChange={handleBpmInputChange}
      inputMode="numeric"
    />
  </div>
);

export default BpmInputSection;
