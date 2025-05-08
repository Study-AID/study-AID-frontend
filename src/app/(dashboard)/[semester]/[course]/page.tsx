'use client';

import { api } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit2,
  LayoutGrid,
  Plus,
} from 'lucide-react';
import { useParams } from 'next/navigation';

export default function SemesterPage() {
  const params = useParams();
  // get /v1/semesters/:semester
  const semester = params.semester as string;

  const { data, isLoading, error } = api.useQuery(
    'get',
    '/v1/courses/semester/{semesterId}',
    {
      params: {
        path: {
          semesterId: semester,
        },
      },
    },
  );

  if (!data || isLoading) {
    return <div>Loading...</div>;
  }

  if (error) return `An error occured: ${error}`;

  return (
    <main className="grid flex-1 grid-cols-[2fr,1fr] gap-6 overflow-auto p-8">
      {/* 좌측 컬럼: 자료구조, 모의시험, 활동로그 */}
      <div className="space-y-6">
        {/* 강의 자료 업로드 */}
        <section className="rounded-lg bg-white shadow">
          <header className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="font-medium">강의 목록</h2>
            <Plus className="cursor-pointer text-gray-600 hover:text-gray-800" />
          </header>
          <div className="rounded-b-lg border-2 border-dashed border-gray-300 p-12 text-center text-gray-500">
            <p className="mb-2">
              업로드할 강의 자료{' '}
              <span className="text-indigo-600">파일을 선택</span>하거나 드래그
              앤 드롭 하세요.
            </p>
            <p className="text-sm">
              지원되는 파일 형식: PDF, PPTX, TXT, Markdown, MP3
            </p>
          </div>
        </section>

        {/* 모의 시험 */}
        <section className="rounded-lg bg-white shadow">
          <header className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="font-medium">모의 시험</h2>
            <Plus className="cursor-pointer text-gray-600 hover:text-gray-800" />
          </header>
          <div className="flex justify-center p-8">
            <button className="flex h-40 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed bg-gray-100 text-gray-400 hover:bg-gray-200">
              <Plus size={32} />
              <span className="mt-2">모의 시험 추가하기</span>
            </button>
          </div>
        </section>

        {/* 활동 로그 */}
        <section className="rounded-lg bg-white shadow">
          <header className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="font-medium">활동 로그</h2>
            <LayoutGrid className="cursor-pointer text-gray-600 hover:text-gray-800" />
          </header>
          <div className="p-8 text-center text-gray-400">
            활동 내역이 없습니다.
          </div>
        </section>
      </div>

      {/* 우측 컬럼: 위젯들 */}
      <div className="space-y-6">
        {/* 퀴즈 통계 */}
        <section className="rounded-lg bg-white p-4 shadow">
          <h3 className="mb-4 font-medium">퀴즈 통계</h3>
          <div className="flex h-24 items-center justify-center text-gray-400">
            퀴즈 통계가 없습니다.
          </div>
        </section>

        {/* 약점 분석 및 추천 */}
        <section className="rounded-lg bg-white p-4 shadow">
          <h3 className="mb-4 font-medium">약점 분석 및 공부 추천</h3>
          <div className="flex h-24 items-center justify-center text-gray-400">
            활동 내역이 없습니다.
          </div>
        </section>

        {/* 학점 관리 */}
        <section className="rounded-lg bg-white p-4 shadow">
          <h3 className="mb-4 font-medium">학점 관리</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            {['목표 성적', '취득 성적', '이수 학점'].map((label) => (
              <div key={label} className="space-y-1">
                <p className="text-sm text-gray-600">{label}</p>
                <div className="flex h-10 items-center justify-center rounded bg-gray-100">
                  -
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 성과 기록 */}
        <section className="rounded-lg bg-white shadow">
          <header className="flex items-center justify-between border-b px-6 py-4">
            <h3 className="font-medium">성과 기록</h3>
            <Plus className="cursor-pointer text-gray-600 hover:text-gray-800" />
          </header>
          <div className="p-4">
            {/* 예시 차트 바 (단순 회색 박스) */}
            <div className="mb-4 h-4 rounded bg-gray-200" />

            {/* 평가 테이블 */}
            <table className="mb-2 w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="py-2">평가 항목</th>
                  <th className="py-2">만점</th>
                  <th className="py-2">점수</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2">
                    <input
                      type="text"
                      placeholder="예시: 출석"
                      className="w-full rounded border px-2 py-1"
                    />
                  </td>
                  <td className="py-2">
                    <input
                      type="text"
                      placeholder="예시: 10"
                      className="w-full rounded border px-2 py-1"
                    />
                  </td>
                  <td className="py-2">
                    <input
                      type="text"
                      placeholder="예시: 10"
                      className="w-full rounded border px-2 py-1"
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            {/* 행 추가 버튼 */}
            <button className="flex w-full items-center justify-center rounded bg-gray-800 py-2 text-white hover:bg-gray-900">
              <Plus className="mr-1" /> 항목 추가
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
