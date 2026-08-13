import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  placeholder: string;
  searchValue: string;
  setSearchValue: (value: string) => void;
}

const DebouncedSearchBar: React.FC<SearchBarProps> = ({
  placeholder,
  searchValue,
  setSearchValue,
}) => {
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
    <div className="relative w-full">
      <Search
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
      />
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full rounded-full border border-white/10 bg-paper-600/60 py-2 pl-9 pr-3 text-sm text-white placeholder:text-gray-500 transition focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
};

export default DebouncedSearchBar;
