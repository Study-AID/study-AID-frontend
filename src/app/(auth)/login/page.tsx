'use client';

import { api } from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LoginFormValues, loginSchema } from './schema';

export default function Login() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormValues) => {
      return api.post('/api/v1/auth/login', data);
    },
    onSuccess: (data) => {
      // Store token and redirect
      sessionStorage.setItem('access_token', data.access_token);
      router.push('/');
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onGoogleLogin = () => {
    // GET `/api/auth/google/login`
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="이메일 주소"
            {...register('email')}
            className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
        <div>
          <input
            type="password"
            placeholder="비밀번호"
            {...register('password')}
            className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full rounded-lg bg-indigo-600 p-3 text-white transition hover:bg-indigo-700 disabled:bg-indigo-400"
        >
          {loginMutation.isPending ? '로그인 중...' : '로그인'}
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
