'use client';

import { useState, useEffect } from 'react';
import { readAnswersData } from '@/lib/data';

interface SearchResult {
  clue: string;
  answer: string;
  position: string;
  date: string;
  slug: string;
}

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    // Search through all answers
    const allAnswers: SearchResult[] = [];
    const answersData = readAnswersData();
    
    Object.values(answersData).forEach((dayData: any) => {
      dayData.answers.forEach((answer: any) => {
        const slug = answer.clue
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .trim();
        
        allAnswers.push({
          ...answer,
          date: dayData.date,
          slug
        });
      });
    });

    // Filter results
    const filtered = allAnswers.filter(answer => 
      answer.clue.toLowerCase().includes(query.toLowerCase()) ||
      answer.answer.toLowerCase().includes(query.toLowerCase()) ||
      answer.position.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5); // Limit to 5 results

    setResults(filtered);
    setIsOpen(filtered.length > 0);
  }, [query]);

  const handleResultClick = (slug: string) => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    window.location.href = `/answer/${slug}`;
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder="Search crossword answers..."
          className="w-full px-4 py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={index}
              onClick={() => handleResultClick(result.slug)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 line-clamp-1">
                    {result.clue}
                  </div>
                  <div className="text-sm text-blue-600 font-semibold">
                    {result.answer}
                  </div>
                </div>
                <div className="ml-4 text-xs text-gray-500">
                  {result.position}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
