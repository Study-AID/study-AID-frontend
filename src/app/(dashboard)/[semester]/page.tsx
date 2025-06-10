'use client';

import { api } from '@/api/client';
import { AddCourseCard, CourseCard } from '@/component/CourseCard';
import { Button } from '@/component/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/component/ui/card';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit,
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
        queryKey: [
          'get',
          '/v1/courses/semester/{semesterId}',
          {
            params: {
              path: {
                semesterId: semester,
              },
            },
          },
        ],
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
      <section className="flex-1 rounded-lg bg-[#F7F7F7] p-6 shadow">
        <div className="">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium">과목 목록</h3>
            <button className="flex items-center text-gray-600 hover:text-gray-800">
              정렬 기준 <ChevronDown className="ml-1" />
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
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
                router.push(`/create/course?semesterId=${semester}`)
              }
            />
          </div>
        </div>
      </section>

      {/* 우측 사이드바 */}
      <div className="w-80 space-y-6 border-l border-[#e6e6e6] bg-white px-6">
        {/* 학기 진행률 */}
        <Card className="border-[#e6e6e6]">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-[#1d1b20]">
                학기 진행률
              </CardTitle>
              <Button
                size="sm"
                className="bg-[#5971e7] text-xs text-white hover:bg-[#4a5fd1]"
              >
                <Edit className="mr-1 h-3 w-3" />
                등록하기
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-[8px] border-[#5971e7]">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#1d1b20]">D-18</div>
                </div>
              </div>
            </div>
            <div className="text-center text-sm text-[#757575]">
              <p>개강: 2025.03.04</p>
              <p>종강: 2025.06.23</p>
            </div>
          </CardContent>
        </Card>

        {/* 학사 일정 */}
        <Card className="border-[#e6e6e6]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-[#1d1b20]">학사 일정</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Calendar Header */}
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-[#1d1b20]">2025.03</h3>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {['월', '화', '수', '목', '금', '토', '일'].map((day) => (
                <div key={day} className="p-2 font-medium text-[#757575]">
                  {day}
                </div>
              ))}
              {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                <div
                  key={date}
                  className={`cursor-pointer rounded p-2 hover:bg-[#f5f5f5] ${
                    date === 14
                      ? 'rounded-full bg-[#1d1b20] text-white'
                      : date === 20
                        ? 'rounded-full bg-[#5971e7] text-white'
                        : 'text-[#1d1b20]'
                  }`}
                >
                  {date}
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg bg-[#f8f9fa] p-3">
              <p className="text-sm text-[#757575]">
                아직 등록된 일정이 없어요!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 학점 관리 */}
        <Card className="border-[#e6e6e6]">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-[#1d1b20]">
                학점 관리
              </CardTitle>
              <Button
                size="sm"
                className="bg-[#5971e7] text-xs text-white hover:bg-[#4a5fd1]"
              >
                <Edit className="mr-1 h-3 w-3" />
                등록하기
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="mb-1 text-sm text-[#757575]">목표 성적</p>
                <p className="text-xl font-bold text-[#1d1b20]">4.5</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-[#757575]">취득 성적</p>
                <p className="text-xl font-bold text-[#1d1b20]">4.3</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-[#757575]">이수 학점</p>
                <p className="text-xl font-bold text-[#1d1b20]">15</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
