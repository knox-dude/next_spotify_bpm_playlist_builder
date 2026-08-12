import React, { useState } from 'react';

interface GenerateButtonProps {
  canSubmit: () => boolean;
}

const GenerateButton: React.FC<GenerateButtonProps> = ({ canSubmit }) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  return (
    <div
      className="relative w-full sm:w-auto"
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
    >
      <button
        type="submit"
        className="mb-4 mt-4 w-full rounded-md bg-paper-500 p-3 text-white disabled:cursor-not-allowed disabled:opacity-30 enabled:hover:bg-paper-600 sm:w-auto sm:p-2"
        disabled={!canSubmit()}
      >
        Generate BPM
      </button>
      {!canSubmit() && isHovered && (
        <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden w-64 -translate-x-1/2 transform rounded-md bg-gray-700 py-1 text-center text-sm text-white opacity-90 sm:block">
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
