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
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return null;
}
