"use client";

import { PropsWithChildren, useEffect } from "react";
import { useAuthState } from "./authProvider";

export default function CheckAuthLayout({ children }: PropsWithChildren) {
  const { isLoggedIn, setIsLoggedIn } = useAuthState();

  useEffect(() => {
    // Check if user is logged in
  }, []);

  if (isLoggedIn === undefined) {
    return null;
  }

  return children;
}
