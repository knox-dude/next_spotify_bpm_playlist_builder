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
  <div className="items-center">
    <TextInput
      label="lowBpm"
      value={lowBpm}
      placeholder="Enter lower BPM"
      onChange={handleBpmInputChange}
    />
    <TextInput
      label="highBpm"
      value={highBpm}
      placeholder="Enter higher BPM"
      onChange={handleBpmInputChange}
    />
  </div>
);

export default BpmInputSection;
