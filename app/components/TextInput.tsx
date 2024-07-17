import React from 'react';

interface TextInputProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const TextInput: React.FC<TextInputProps> = ({ label, value, placeholder, onChange, className = '' }) => (
    <input
      className={`text-black bg-gray-200 rounded-md m-2 text-center p-1 ${className}`}
      placeholder={placeholder}
      name={label}
      type="text"
      value={value}
      onChange={onChange}
    />
);

export default TextInput;
