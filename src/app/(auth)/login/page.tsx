'use client';

import Link from 'next/link';
import React, { useState } from 'react';

export default function Login() {
  //react-hook-form 으로 변경할 것
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  //Server Action 으로 변경할 것
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Logging in:', { email, password });
  };

  //Forwarding 으로 변경할 것
  const onGoogleLogin = () => {
    console.log('Google 로그인');
  };

  return (
    <>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="이메일 주소"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          required
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-indigo-600 p-3 text-white transition hover:bg-indigo-700"
        >
          로그인
        </button>
      </form>

      <div className="my-6 flex items-center">
        <hr className="flex-grow border-t border-gray-300" />
        <span className="mx-4 text-sm text-gray-500">또는</span>
        <hr className="flex-grow border-t border-gray-300" />
      </div>

      <button
        onClick={onGoogleLogin}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 p-3 transition hover:bg-gray-100"
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google logo"
          className="h-5 w-5"
        />
        <span className="text-sm font-medium text-gray-700">
          Google 계정으로 로그인
        </span>
      </button>

      <p className="mt-6 text-center text-sm text-gray-600">
        계정이 없으신가요?{' '}
        <Link href="/register" className="text-indigo-600 hover:underline">
          회원가입
        </Link>
      </p>
    </>
  );
}
