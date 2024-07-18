import React, { useState } from 'react';

interface GenerateButtonProps {
  canSubmit: () => boolean;
}

const GenerateButton: React.FC<GenerateButtonProps> = ({ canSubmit }) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  return (
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
          -both bpm inputs must be numbers
          <br />
          -lower bpm must be lower than or equal to higher bpm
          <br />
          -select one playlist or top songs
        </div>
      )}
    </div>
  );
};

export default GenerateButton;
