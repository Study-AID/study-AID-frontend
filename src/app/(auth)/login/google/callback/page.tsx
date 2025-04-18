'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function GoogleCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Get the access token from URL query parameters
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');

      if (!accessToken) {
        setError('액세스 토큰이 없습니다');
        setIsLoading(false);
        return;
      }

      // Store access token in localStorage
      localStorage.setItem('accessToken', accessToken);

      // If refresh token is provided in URL, store it in cookie
      if (refreshToken) {
        Cookies.set('refreshToken', refreshToken, {
          expires: 14, // 14 days
          secure: window.location.protocol === 'https:',
          sameSite: 'lax',
        });
      }

      // Get refresh token from cookies (it might be set by the server as HttpOnly)
      // This is just a check, actual HttpOnly cookies cannot be read from JavaScript
      const storedRefreshToken = Cookies.get('refresh_token');
      if (!refreshToken && !storedRefreshToken) {
        console.warn('리프레시 토큰이 쿠키에 설정되지 않았습니다.');
      }

      // Redirect to home page
      router.replace('/');
    } catch (err) {
      console.error('로그인 처리 중 오류 발생:', err);
      setError('로그인 처리 중 오류가 발생했습니다');
      setIsLoading(false);
    }
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p className="text-red-500">{error}</p>
        <button
          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white"
          onClick={() => router.push('/login')}
        >
          로그인 페이지로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <p className="text-xl">로그인 처리 중...</p>
      <div className="mt-4 h-8 w-8 animate-spin rounded-full border-t-4 border-solid border-blue-500"></div>
    </div>
  );
}
