import React from 'react';

interface TextInputProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TextInput: React.FC<TextInputProps> = ({ label, value, placeholder, onChange }) => (
  <div className=' items-center'>
    <input className='text-black bg-gray-200 rounded-md m-2' placeholder={placeholder} name={label} type="text" value={value} onChange={onChange} />
  </div>
);

export default TextInput;
