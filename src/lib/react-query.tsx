'use client';

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import axios from 'axios';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';

export default function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const path = usePathname();

  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
          },
          mutations: {
            retry: false,
          },
        },
        queryCache: new QueryCache({
          onError: (error, query) => {
            if (axios.isAxiosError(error)) {
              if (error.response?.status === 401 && !path.includes('/login')) {
                query.reset();
                router.push('/login', { scroll: false });
              }
              if (error.response?.status === 500) {
                alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
              }
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            if (
              axios.isAxiosError(error) &&
              error.response?.status === 401 &&
              !path.includes('/login')
            ) {
              router.push('/login', { scroll: false });
            }
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
