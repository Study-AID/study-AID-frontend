// components/AuthLayout.tsx
import React from "react";

type AuthLayoutProps = {
  title: string;
  children: React.ReactNode;
};

export default async function AuthLayout({ title, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Study AID
        </h1>
        <h2 className="text-xl font-semibold text-center mb-6">{title}</h2>
        {children}
      </div>
    </div>
  );
}
