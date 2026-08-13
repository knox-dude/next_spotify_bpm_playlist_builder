import React from 'react';
import { PRIMARY_BUTTON } from './ui/styles';

interface GenerateButtonProps {
  disabled: boolean;
  /** Why the button is disabled, if it is. */
  reasons: string[];
}

/**
 * The submit control, plus the reason it can't be pressed yet.
 *
 * The reasons used to live in a hover tooltip, which meant a phone user got a
 * dead button and no explanation at all.
 */
const GenerateButton: React.FC<GenerateButtonProps> = ({
  disabled,
  reasons,
}) => (
  <div className="flex flex-col items-center gap-3">
    <button type="submit" className={`w-full sm:w-auto ${PRIMARY_BUTTON}`} disabled={disabled}>
      Find matching songs
    </button>

    {disabled && reasons.length > 0 && (
      <ul className="space-y-0.5 text-center text-xs text-gray-500">
        {reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
    )}
  </div>
);

export default GenerateButton;
