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
      className="pl-2 border border-gray-300 text-gray-600 rounded"
    />
  );
};

export default DebouncedSearchBar;
