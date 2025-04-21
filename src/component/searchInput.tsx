'use client';

import { Search } from 'lucide-react';

export function SearchInput({
  placeholder = 'Search...',
}: {
  placeholder?: string;
}) {
  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-300 py-2 pr-4 pl-10 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      />
    </div>
  );
}
