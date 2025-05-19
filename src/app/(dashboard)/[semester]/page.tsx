'use client';

import { api } from '@/api/client';
import { AddCourseCard, CourseCard } from '@/component/CourseCard';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Plus,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SemesterPage() {
  const router = useRouter();
  const params = useParams();
  const utils = useQueryClient();
  // get /v1/semesters/:semester
  const semester = params.semester as string;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftDisplay, setDraftDisplay] = useState('');

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

  const updateCourse = api.useMutation('put', '/v1/courses/{id}', {
    onSuccess: (data) => {
      utils.invalidateQueries({
        queryKey: ['/v1/courses/semester/{semesterId}'],
      });

      console.log('invalidate');
      // setEditingId(null);
    },
  });

  if (!data || isLoading) {
    return <div>Loading...</div>;
  }

  if (error) return `An error occured: ${error}`;

  const startEdit = (courseId: string, currentTitle: string) => {
    setEditingId(courseId);
    setDraftDisplay(currentTitle);
  };

  const cancelEdit = () => setEditingId(null);

  const onSave = (courseId: string, newTitle: string) => {
    if (draftDisplay === '') {
      return;
    }
    updateCourse.mutate({
      params: {
        path: {
          id: courseId,
        },
      },
      body: {
        name: newTitle,
      },
    });
  };

  return (
    <main className="flex flex-1 gap-8 overflow-auto px-1 py-3">
      {/* 과목 목록 섹션 */}
      <section className="flex-1 rounded-lg bg-gray-50 p-6 shadow">
        <div className="">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium">과목 목록</h3>
            <button className="flex items-center text-gray-600 hover:text-gray-800">
              정렬 기준 <ChevronDown className="ml-1" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* 실제 과목 카드 반복 */}
            {data.courses?.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isEditing={editingId === course.id}
                draftDisplay={draftDisplay}
                onStartEdit={startEdit}
                onSave={onSave}
                onCancel={cancelEdit}
                onClick={() => router.push(`/${semester}/${course.id}`)}
              />
            ))}

            {/* 예시 비어있을 때 새과목 추가 카드 */}
            <AddCourseCard
              onClick={() =>
                router.push(`/create/course?semesterId=${semester}/`)
              }
            />
          </div>
        </div>
      </section>

      {/* 우측 사이드바 */}
      <aside className="w-80 flex-shrink-0 space-y-6">
        {/* 학기 진행률 */}
        <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow">
          <h3 className="font-medium">학기 진행률</h3>
          <button className="flex items-center rounded bg-green-100 px-3 py-1 text-green-800 hover:bg-green-200">
            <Edit2 className="mr-1" /> 등록하기
          </button>
        </div>

        {/* 학사 일정 */}
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-medium">학사 일정</h3>
            <button className="flex items-center rounded bg-green-100 px-2 py-1 text-green-800 hover:bg-green-200">
              <Edit2 className="mr-1" /> 등록하기
            </button>
          </div>
          {/* 월 탐색 */}
          <div className="mb-2 flex items-center justify-between">
            <button>
              <ChevronLeft />
            </button>
            <span className="font-medium">2025.03</span>
            <button>
              <ChevronRight />
            </button>
          </div>
          {/* 캘린더 그리드 */}
          <table className="w-full text-center text-sm">
            <thead>
              <tr className="text-gray-500">
                {['월', '화', '수', '목', '금', '토', '일'].map((d) => (
                  <th key={d} className="py-1">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* {weeks.map((week,i) => (
              <tr key={i}>
                {week.map((day,j) => {
                  const isToday = day === today
                  const isHighlight = day === highlighted
                  return (
                    <td key={j} className="py-2">
                      {day ? (
                        <span className={`
                          inline-block w-8 h-8 leading-8 rounded-full
                          ${isHighlight ? 'bg-purple-500 text-white' : ''}
                          ${isToday ? 'bg-gray-800 text-white' : ''}
                        `}>
                          {day}
                        </span>
                      ) : null}
                    </td>
                  )
                })}
              </tr>
            ))} */}
            </tbody>
          </table>
          <p className="mt-4 text-gray-400">아직 등록된 일정이 없어요!</p>
        </div>

        {/* 학점 관리 */}
        <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow">
          <h3 className="font-medium">학점 관리</h3>
          <button className="flex items-center rounded bg-green-100 px-3 py-1 text-green-800 hover:bg-green-200">
            <Edit2 className="mr-1" /> 등록하기
          </button>
        </div>
      </aside>
    </main>
  );
}
