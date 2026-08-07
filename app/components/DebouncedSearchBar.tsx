import React, { useState, useEffect } from 'react';

interface SearchBarProps {
  placeholder: string;
  searchValue: string;
  setSearchValue: (value: string) => void;
}

const DebouncedSearchBar: React.FC<SearchBarProps> = ({ placeholder, searchValue, setSearchValue }) => {
  const [inputValue, setInputValue] = useState(searchValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchValue(inputValue);
    }, 300); // 300ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, setSearchValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <input
      type="text"
      value={inputValue}
      onChange={handleChange}
      placeholder={placeholder}
      className="w-full min-w-0 rounded border border-gray-300 p-2 text-gray-600 sm:w-auto"
    />
  );
};

export default DebouncedSearchBar;
