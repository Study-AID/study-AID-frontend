'use client';

import { api } from '@/api/client';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { RegisterFormValues, registerSchema } from './schema';

export default function Signup() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
  });

  const registerMutation = api.useMutation('post', '/v1/auth/signup/email');

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(
      {
        body: data,
      },
      {
        onSuccess: (response) => {
          router.push('/login');
        },
        onError: (error) => {
          console.error('Login error:', error);
        },
      },
    );
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-2">
        <input
          type="name"
          placeholder="성함"
          {...register('name')}
          className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        <input
          type="email"
          placeholder="이메일 주소"
          {...register('email')}
          className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        <div className="flex gap-x-2">
          <input
            type="password"
            placeholder="비밀번호"
            {...register('password')}
            className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <input
            type="password"
            placeholder="비밀번호 확인"
            {...register('confirmPassword')}
            className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-indigo-600 p-3 text-white transition hover:bg-indigo-700"
        >
          회원가입
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="text-indigo-600 hover:underline">
          로그인
        </Link>
      </p>
      <div className="mt-4 text-center text-xs text-gray-500">
        <Link
          href="/api/privacy-policy.html"
          className="text-indigo-600 hover:underline"
        >
          개인정보처리방침
        </Link>
      </div>
    </>
  );
}
