'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function GoogleCallback({
  searchParams,
}: {
  searchParams: { access_token: string };
}) {
  const router = useRouter();

  useEffect(() => {
    const { access_token } = searchParams;

    if (!access_token) {
      throw new Error('엑세스 토큰이 없는데요');
    }

    sessionStorage.setItem('access_token', access_token);

    router.replace('/');
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <p className="text-xl">로그인 처리 중...</p>
    </div>
  );
}
