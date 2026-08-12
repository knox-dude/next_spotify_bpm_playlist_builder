import React from 'react';
import Checkbox from './Checkbox';

interface OptionCheckboxesProps {
  doubleSpeed: boolean;
  setDoubleSpeed: React.Dispatch<React.SetStateAction<boolean>>;
  halfSpeed: boolean;
  setHalfSpeed: React.Dispatch<React.SetStateAction<boolean>>;
  shortTerm: boolean;
  setShortTerm: React.Dispatch<React.SetStateAction<boolean>>;
  mediumTerm: boolean;
  setMediumTerm: React.Dispatch<React.SetStateAction<boolean>>;
  longTerm: boolean;
  setLongTerm: React.Dispatch<React.SetStateAction<boolean>>;
}

const OptionCheckboxes: React.FC<OptionCheckboxesProps> = ({
  doubleSpeed,
  setDoubleSpeed,
  halfSpeed,
  setHalfSpeed,
  shortTerm,
  setShortTerm,
  mediumTerm,
  setMediumTerm,
  longTerm,
  setLongTerm,
}) => (
  <>
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 sm:justify-between sm:gap-4">
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
    </div>

    <h2 className="mt-3 flex w-11/12 justify-center self-center text-lg font-bold text-gray-400 sm:justify-around sm:text-xl">
      Use Top Songs?
    </h2>
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 sm:justify-between sm:gap-4">
      <Checkbox
        label="past month"
        checked={shortTerm}
        hint="Include your top songs from the last 4 weeks."
        onChange={(e) => setShortTerm(e.target.checked)}
      />
      <Checkbox
        label="past six months"
        checked={mediumTerm}
        hint="Include your top songs from the last 6 months."
        onChange={(e) => setMediumTerm(e.target.checked)}
      />
      <Checkbox
        label="all time"
        checked={longTerm}
        hint="Include your top songs of all time."
        onChange={(e) => setLongTerm(e.target.checked)}
      />
    </div>
  </>
);

export default OptionCheckboxes;
