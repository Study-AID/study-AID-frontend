'use client';

import { api } from '@/api/client';
import { useRouter } from 'next/navigation';
import React, { PropsWithChildren, useEffect, useState } from 'react';

export interface CreateContextWithHookOptions {
  errorMessage?: string;
  name?: string;
}

export type CreateContextWithHookReturn<T> = [
  React.Provider<T>,
  () => T,
  React.Context<T>,
];

export function createContextWithHook<ContextType>(
  options: CreateContextWithHookOptions = {},
) {
  const {
    errorMessage = 'useContext: `context` is undefined. Seems you forgot to wrap component within the Provider',
    name,
  } = options;

  const Context = React.createContext<ContextType | undefined>(undefined);
  Context.displayName = name;

  function useContext() {
    const context = React.useContext(Context);
    if (context === undefined) {
      const error = new Error(errorMessage);
      error.name = 'ContextError';
      Error.captureStackTrace?.(error, useContext);
      throw error;
    }
    return context as ContextType;
  }

  return [
    Context.Provider,
    useContext,
    Context,
  ] as CreateContextWithHookReturn<ContextType>;
}

export const [AuthStateContextProvider, useAuthState] = createContextWithHook<{
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  name: 'AuthStateContext',
  errorMessage:
    'useAuthStateContext: `context` is undefined. Forgot to wrap component within <AuthClientProvider>?',
});

export const AuthClientProvider = ({ children }: PropsWithChildren) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  return (
    <AuthStateContextProvider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthStateContextProvider>
  );
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const { isLoggedIn, setIsLoggedIn } = useAuthState();
  const { data: me, isLoading } = api.useQuery('get', '/v1/auth/me', {
    enabled: isLoggedIn,
    retry: false,
  });

  useEffect(() => {
    if (isLoading) return;
    const loggedIn = !!me;
    setIsLoggedIn(loggedIn);
    if (!loggedIn) router.replace('/login');
  }, [isLoading, me, router, setIsLoggedIn]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-t-2 border-b-2 border-gray-900" />
      </div>
    );
  }

  return <>{children}</>;
};
