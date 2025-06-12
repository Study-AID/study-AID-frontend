// components/AuthLayout.tsx
import React from 'react';

type AuthLayoutProps = {
  title: string;
  children: React.ReactNode;
};

export default async function AuthLayout({ title, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 왼쪽 서비스 설명 */}
      <div className="hidden flex-col justify-center bg-indigo-600 p-8 text-white lg:flex lg:w-1/3">
        <div className="mx-auto max-w-md">
          <h2 className="mb-6 text-3xl font-bold">대학생을 위한 LMS</h2>
          <p className="mb-8 text-lg text-indigo-100">
            대학생을 위한 AI 기반 학습관리시스템으로 강의자료 요약부터 퀴즈
            생성, 모의 시험까지 한 번에 관리하세요.
          </p>

          <div className="space-y-6">
            <div className="flex items-start">
              <div className="mr-4 flex-shrink-0 rounded-full bg-indigo-500 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold">강의노트 요약</h3>
                <p className="text-indigo-100">
                  업로드한 강의자료를 AI가 자동으로 요약해주어 복습 시간을
                  줄여줍니다.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="mr-4 flex-shrink-0 rounded-full bg-indigo-500 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold">퀴즈 자동 생성</h3>
                <p className="text-indigo-100">
                  O/X, 객관식, 주관식, 서술형 등 다양한 형태의 문제를
                  제공합니다.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="mr-4 flex-shrink-0 rounded-full bg-indigo-500 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold">학습 분석</h3>
                <p className="text-indigo-100">
                  학습 결과를 분석하여 개인별 취약점을 피드백을 제공합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="my-auto w-full max-w-md p-8 2xl:w-1/3">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">
          Study AID
        </h1>
        <h2 className="mb-6 text-center text-xl font-semibold">{title}</h2>
        {children}
      </div>

      <div className="hidden flex-col justify-center bg-gray-100 p-8 lg:flex lg:w-1/3">
        <div className="mx-auto max-w-md">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">
            Study AID는 이렇게 작동해요
          </h2>

          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-2 text-lg font-semibold text-indigo-600">
                1. 강의자료 업로드
              </h3>
              <p className="text-gray-600">
                PDF나 이미지로 된 강의노트를 업로드하세요.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-2 text-lg font-semibold text-indigo-600">
                2. AI 요약 & 퀴즈 생성
              </h3>
              <p className="text-gray-600">
                AI가 내용을 분석해 요약하고, 문제를 자동으로 생성해줍니다.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-2 text-lg font-semibold text-indigo-600">
                3. 실시간 분석 & 피드백
              </h3>
              <p className="text-gray-600">
                학습 결과를 토대로 학습 성과를 분석하고 개선점을 알려드립니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
