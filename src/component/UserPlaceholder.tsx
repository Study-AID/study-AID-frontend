'use client';

import { api } from '@/api/client';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Transition,
} from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import { Fragment } from 'react';

export function UserPlaceholder() {
  const { data: me, isLoading, error } = api.useQuery('get', '/v1/auth/me', {});

  return (
    <div className="relative flex items-center gap-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 font-medium text-gray-600">
        {me?.data?.name?.charAt(0)}
      </div>
      <Disclosure as="div" className="">
        {({ open }) => (
          <>
            <DisclosureButton className="flex items-center gap-1 bg-transparent text-gray-700 focus:outline-none">
              <span className="font-semibold">{me?.data?.name}님</span>
              <ChevronDown className="h-4 w-4 transform transition-transform" />
            </DisclosureButton>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <DisclosurePanel className="absolute right-0 mt-2 w-40 rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none">
                <div className="py-1">
                  <button className="flex w-full items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Edit<span className="text-xs text-gray-500">⌘ E</span>
                  </button>
                  <button className="flex w-full items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Duplicate<span className="text-xs text-gray-500">⌘ D</span>
                  </button>
                  <div className="my-1 border-t border-gray-100" />
                  <button className="flex w-full items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Archive<span className="text-xs text-gray-500">⌘ N</span>
                  </button>
                </div>
              </DisclosurePanel>
            </Transition>
          </>
        )}
      </Disclosure>
    </div>
  );
}
