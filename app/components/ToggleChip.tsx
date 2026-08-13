import React from 'react';

interface ToggleChipProps {
  label: string;
  checked: boolean;
  /** Explains what the option does; shown on hover and to screen readers. */
  hint: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * A checkbox drawn as a pill.
 *
 * Still a real `<input type="checkbox">` underneath - it keeps the keyboard and
 * screen-reader behaviour that a `<div onClick>` would throw away, and the pill
 * is just the label doing the drawing.
 */
const ToggleChip: React.FC<ToggleChipProps> = ({
  label,
  checked,
  hint,
  onChange,
}) => (
  <label
    title={hint}
    className={`inline-flex cursor-pointer select-none items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition focus-within:ring-2 focus-within:ring-primary/50 ${
      checked
        ? 'border-primary/60 bg-primary/15 text-white'
        : 'border-white/10 bg-paper-600/60 text-gray-300 hover:border-white/25 hover:text-white'
    }`}
  >
    <input
      type="checkbox"
      className="sr-only"
      checked={checked}
      onChange={onChange}
      aria-label={label}
      aria-describedby={undefined}
      title={hint}
    />
    <span
      aria-hidden="true"
      className={`h-2 w-2 rounded-full transition ${
        checked ? 'bg-primary' : 'bg-gray-dark'
      }`}
    />
    {label}
  </label>
);

export default ToggleChip;
