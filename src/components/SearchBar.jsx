import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ onSearch, initialValue = '' }) {
  const [query, setQuery] = useState(initialValue);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    if (initialValue !== query) {
      setQuery(initialValue);
    }
  }, [initialValue]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      onSearch(val);
    }, 500);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
    inputRef.current?.focus();
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="relative max-w-3xl mx-auto w-full group">
      <div className="absolute inset-y-0 left-0 pl-4 sm:pl-6 flex items-center pointer-events-none z-10">
        <Search className="h-5 w-5 sm:h-6 sm:w-6 text-primary group-focus-within:text-secondary transition-colors" />
      </div>
      <input
        ref={inputRef}
        type="text"
        className="block w-full pl-12 sm:pl-16 pr-12 sm:pr-14 py-4 sm:py-5 bg-surface1 border-2 border-primary/50 rounded-full text-white placeholder-[#475569] font-display text-base sm:text-xl focus:outline-none focus:border-secondary focus:shadow-[0_0_30px_rgba(124,58,237,0.3)] transition-all"
        placeholder="Search albums, artists, songs..."
        value={query}
        onChange={handleChange}
      />
      {query && (
        <button
          onClick={clearSearch}
          className="absolute inset-y-0 right-0 pr-4 sm:pr-6 flex items-center text-[#475569] hover:text-white transition-colors z-10"
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      )}
    </div>
  );
}
