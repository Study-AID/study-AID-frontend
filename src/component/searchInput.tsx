'use client';

import { Search } from 'lucide-react';
import { Input } from './ui/input';

export function SearchInput({
  placeholder = 'Search...',
}: {
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform text-[#757575]" />
      <Input
        placeholder=""
        // value={searchQuery}
        // onChange={(e) => setSearchQuery(e.target.value)}
        className="rounded-md border-[#d9d9d9] bg-white pr-10"
      />
    </div>
  );
}
