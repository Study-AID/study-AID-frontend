'use client';

import { useIsFetching, useIsMutating } from '@tanstack/react-query';

export default function LayoutLoading() {
  const mutatingCount = useIsMutating({
    predicate: (mutation) => {
      return !(mutation.meta?.isBackgroundTask === true);
    },
  });

  if (mutatingCount > 0) {
    return (
      <div className="absolute top-1/2 left-1/2 z-10 flex h-screen w-screen -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-white/40">
        <div className="h-16 w-16 animate-spin rounded-full border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return null;
}
