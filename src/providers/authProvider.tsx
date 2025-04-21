'use client';

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

    return context;
  }

  return [
    Context.Provider,
    useContext,
    Context,
  ] as CreateContextWithHookReturn<ContextType>;
}

export const [AuthStateContextProvider, useAuthState] = createContextWithHook<{
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean | undefined>>;
}>({
  name: 'AuthStateContext',
  errorMessage:
    'useAuthStateContext: `context` is undefined. Seems you forgot to wrap component within <AuthStateProvider />',
});

export const AuthClientProvider = ({ children }: PropsWithChildren) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    // TODO: Try fetch user data, and set LoggedIn state

    setTimeout(() => {
      setIsLoggedIn(true);
    }, 1000);
  }, []);

  // Loading State
  if (isLoggedIn === undefined) {
    // TODO: Add loading state (ex: spinner)
    return null;
  }

  return (
    <AuthStateContextProvider
      value={{
        isLoggedIn: isLoggedIn,
        setIsLoggedIn: setIsLoggedIn,
      }}
    >
      {children}
    </AuthStateContextProvider>
  );
};
