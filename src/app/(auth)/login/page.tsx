"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function Login() {
  //react-hook-form 으로 변경할 것
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  //Server Action 으로 변경할 것
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Logging in:", { email, password });
  };

  //Forwarding 으로 변경할 것
  const onGoogleLogin = () => {
    console.log("Google 로그인");
  };

  return (
    <>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="이메일 주소"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition"
        >
          로그인
        </button>
      </form>

      <div className="my-6 flex items-center">
        <hr className="flex-grow border-t border-gray-300" />
        <span className="mx-4 text-gray-500 text-sm">또는</span>
        <hr className="flex-grow border-t border-gray-300" />
      </div>

      <button
        onClick={onGoogleLogin}
        className="w-full border border-gray-300 rounded-lg p-3 flex items-center justify-center gap-2 hover:bg-gray-100 transition"
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google logo"
          className="w-5 h-5"
        />
        <span className="text-sm font-medium text-gray-700">
          Google 계정으로 로그인
        </span>
      </button>

      <p className="mt-6 text-center text-sm text-gray-600">
        계정이 없으신가요?{" "}
        <Link href="/register" className="text-indigo-600 hover:underline">
          회원가입
        </Link>
      </p>
    </>
  );
}
