'use client';

import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from '@headlessui/react';
import { ChevronDown, Search } from 'lucide-react';
import { Fragment } from 'react';

/**
 * 사용자 아바타 및 드롭다운 메뉴 컴포넌트
 */
export function UserPlaceholder() {
  return (
    <div className="flex items-center gap-4">
      {/* Avatar */}
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 font-medium text-gray-600">
        장
      </div>

      {/* Dropdown 메뉴 */}
      <Menu as="div" className="relative">
        <MenuButton className="flex items-center gap-1 bg-transparent text-gray-700 focus:outline-none">
          <span className="font-semibold">장우성</span>
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </MenuButton>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <MenuItems className="absolute right-0 z-10 mt-2 w-40 rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none">
            <div className="py-1">
              <MenuItem>
                {({ active }) => (
                  <button
                    className={`flex w-full items-center justify-between px-4 py-2 text-sm ${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    }`}
                  >
                    Edit
                    <span className="text-xs text-gray-500">⌘ E</span>
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ active }) => (
                  <button
                    className={`flex w-full items-center justify-between px-4 py-2 text-sm ${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    }`}
                  >
                    Duplicate
                    <span className="text-xs text-gray-500">⌘ D</span>
                  </button>
                )}
              </MenuItem>
              <div className="my-1 border-t border-gray-100" />
              <MenuItem>
                {({ active }) => (
                  <button
                    className={`flex w-full items-center justify-between px-4 py-2 text-sm ${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    }`}
                  >
                    Archive
                    <span className="text-xs text-gray-500">⌘ N</span>
                  </button>
                )}
              </MenuItem>
            </div>
          </MenuItems>
        </Transition>
      </Menu>
    </div>
  );
}

/**
 * 검색 입력 컴포넌트
 */
export function SearchInput({
  placeholder = 'Search...',
}: {
  placeholder?: string;
}) {
  return (
    <div className="relative w-full max-w-sm">
      <Search
        className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400"
        aria-hidden="true"
      />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-300 py-2 pr-4 pl-10 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      />
    </div>
  );
}
