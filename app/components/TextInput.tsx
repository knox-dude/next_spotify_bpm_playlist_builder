import React from 'react';

interface TextInputProps {
  /** Doubles as the field's `name` and its accessible name. */
  label: string;
  value: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  /** Lets the BPM fields bring up a numeric keypad on mobile. */
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  placeholder,
  onChange,
  className = '',
  inputMode,
}) => (
  <input
    className={`w-full rounded-xl border border-white/10 bg-paper-600 px-4 py-3 text-base text-white placeholder:text-gray-600 transition focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 ${className}`}
    placeholder={placeholder}
    name={label}
    aria-label={label}
    type="text"
    inputMode={inputMode}
    value={value}
    onChange={onChange}
  />
);

export default TextInput;
