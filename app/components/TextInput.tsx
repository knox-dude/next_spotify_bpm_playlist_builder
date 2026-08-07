import React from 'react';

interface TextInputProps {
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
    className={`m-2 rounded-md bg-gray-200 p-2 text-center text-black ${className}`}
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
