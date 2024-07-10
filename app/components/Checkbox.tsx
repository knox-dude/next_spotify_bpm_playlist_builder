import React, { useState } from 'react';

interface CheckboxProps {
  label: string;
  checked: boolean;
  hint: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, hint, onChange }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
    >
      <label className="flex items-center space-x-2">
        <input type="checkbox" checked={checked} onChange={onChange} className="form-checkbox" />
        <span>{label}</span>
      </label>
      {isHovered && (
        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-32 bg-gray-700 text-white text-center text-sm rounded-md py-1 opacity-90">
          {hint}
        </span>
      )}
    </div>
  );
};

export default Checkbox;
