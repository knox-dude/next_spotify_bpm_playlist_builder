import React, { useState } from 'react';

interface CheckboxProps {
  label: string;
  checked: boolean;
  hint: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  hint,
  onChange,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
    >
      {/* `title` carries the hint on touch devices, which never hover. */}
      <label
        className="flex cursor-pointer items-center space-x-2 py-1"
        title={hint}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="form-checkbox h-4 w-4 shrink-0 accent-primary"
        />
        <span className="text-sm sm:text-base">{label}</span>
      </label>
      {isHovered && (
        <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-32 -translate-x-1/2 transform rounded-md bg-gray-700 py-1 text-center text-sm text-white opacity-90 sm:block">
          {hint}
        </span>
      )}
    </div>
  );
};

export default Checkbox;
