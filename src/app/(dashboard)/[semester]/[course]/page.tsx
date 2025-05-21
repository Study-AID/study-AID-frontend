'use client';

import { api } from '@/api/client';
import { LayoutGrid, Plus } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { LectureList } from './_components/lecture';

export default function CoursePage() {
  const params = useParams();
  const courseId = params.course as string;
  const semesterId = params.semester as string;

  return <CourseContent courseId={courseId} semesterId={semesterId} />;
}

function CourseContent({
  courseId,
  semesterId,
}: {
  courseId: string;
  semesterId: string;
}) {
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = api.useQuery(
    'get',
    '/v1/lectures/course/{courseId}',
    {
      params: {
        path: {
          courseId: courseId,
        },
      },
    },
  );

  const lectures = useMemo(() => {
    if (!data || isLoading || !data.lectures) return [];

    if (search === '') return data.lectures;

    return data.lectures.filter((lecture) =>
      lecture.title.toLowerCase().includes(search.toLowerCase()),
    );
  }, [data, isLoading, search]);

  if (!data || isLoading || !data.lectures) {
    return <div>Loading...</div>;
  }

  if (error) return `An error occured: ${error}`;

  return (
    <main className="grid flex-1 grid-cols-[1.5fr_1fr] gap-6 overflow-auto">
      <div className="space-y-6">
        <DndProvider backend={HTML5Backend}>
          <LectureList
            courseId={courseId}
            semesterId={semesterId}
            initialLectures={lectures}
            search={search}
            setSearch={setSearch}
          />
        </DndProvider>

        <section className="rounded-lg bg-[#F7F7F7] shadow">
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

        <section className="rounded-lg bg-[#F7F7F7] shadow">
          <header className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="font-medium">활동 로그</h2>
            <LayoutGrid className="cursor-pointer text-gray-600 hover:text-gray-800" />
          </header>
          <div className="p-8 text-center text-gray-400">
            활동 내역이 없습니다.
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="rounded-lg bg-[#F7F7F7] p-4 shadow">
          <h3 className="mb-4 font-medium">퀴즈 통계</h3>
          <div className="flex h-24 items-center justify-center text-gray-400">
            퀴즈 통계가 없습니다.
          </div>
        </section>

        <section className="rounded-lg bg-[#F7F7F7] p-4 shadow">
          <h3 className="mb-4 font-medium">약점 분석 및 공부 추천</h3>
          <div className="flex h-24 items-center justify-center text-gray-400">
            활동 내역이 없습니다.
          </div>
        </section>

        <section className="rounded-lg bg-[#F7F7F7] p-4 shadow">
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

        <section className="rounded-lg bg-[#F7F7F7] shadow">
          <header className="flex items-center justify-between border-b px-6 py-4">
            <h3 className="font-medium">성과 기록</h3>
            <Plus className="cursor-pointer text-gray-600 hover:text-gray-800" />
          </header>
          <div className="p-4">
            <div className="mb-4 h-4 rounded bg-gray-200" />

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

            <button className="flex w-full items-center justify-center rounded bg-gray-800 py-2 text-white hover:bg-gray-900">
              <Plus className="mr-1" /> 항목 추가
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
