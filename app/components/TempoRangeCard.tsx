import React from 'react';
import TextInput from './TextInput';
import ToggleChip from './ToggleChip';
import { CARD, SECTION_LABEL } from './ui/styles';

interface TempoRangeCardProps {
  lowBpm: string;
  highBpm: string;
  handleBpmInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setRange: (low: string, high: string) => void;
  doubleSpeed: boolean;
  setDoubleSpeed: React.Dispatch<React.SetStateAction<boolean>>;
  halfSpeed: boolean;
  setHalfSpeed: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Typical cadences, so the first thing a new user sees is a starting point
 * rather than two empty boxes. Ranges are steps-per-minute for each gait.
 */
const PRESETS = [
  { label: 'Walk', low: '100', high: '120' },
  { label: 'Jog', low: '140', high: '160' },
  { label: 'Run', low: '165', high: '185' },
];

const TempoRangeCard: React.FC<TempoRangeCardProps> = ({
  lowBpm,
  highBpm,
  handleBpmInputChange,
  setRange,
  doubleSpeed,
  setDoubleSpeed,
  halfSpeed,
  setHalfSpeed,
}) => (
  <section className={`${CARD} p-5 sm:p-6`}>
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h2 className={SECTION_LABEL}>Tempo range</h2>
      <span className="text-xs text-gray-500">beats per minute</span>
    </div>

    <div className="mt-4 grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
      <div>
        <p className="mb-1.5 text-xs font-semibold text-gray-400">From</p>
        <TextInput
          label="lowBpm"
          value={lowBpm}
          placeholder="120"
          onChange={handleBpmInputChange}
          inputMode="numeric"
        />
      </div>
      <span className="hidden pb-3 text-sm text-gray-600 sm:block">to</span>
      <div>
        <p className="mb-1.5 text-xs font-semibold text-gray-400">To</p>
        <TextInput
          label="highBpm"
          value={highBpm}
          placeholder="140"
          onChange={handleBpmInputChange}
          inputMode="numeric"
        />
      </div>
    </div>

    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="text-xs text-gray-500">Try:</span>
      {PRESETS.map((preset) => {
        const active = lowBpm === preset.low && highBpm === preset.high;
        return (
          <button
            key={preset.label}
            type="button"
            onClick={() => setRange(preset.low, preset.high)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
              active
                ? 'border-primary/60 bg-primary/15 text-white'
                : 'border-white/10 bg-paper-600/60 text-gray-300 hover:border-white/25 hover:text-white'
            }`}
          >
            {preset.label} {preset.low}-{preset.high}
          </button>
        );
      })}
    </div>

    <div className="mt-5 border-t border-white/5 pt-4">
      <p className="mb-2 text-xs text-gray-500">
        A 160 BPM song still works for a 80 BPM stride - include those too?
      </p>
      <div className="flex flex-wrap gap-2">
        <ToggleChip
          label="double speed"
          checked={doubleSpeed}
          hint="Include songs that are double the desired BPM range."
          onChange={(e) => setDoubleSpeed(e.target.checked)}
        />
        <ToggleChip
          label="half speed"
          checked={halfSpeed}
          hint="Include songs that are half the desired BPM range."
          onChange={(e) => setHalfSpeed(e.target.checked)}
        />
      </div>
    </div>
  </section>
);

export default TempoRangeCard;
