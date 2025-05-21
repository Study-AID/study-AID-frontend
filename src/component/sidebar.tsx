'use client';

import { api } from '@/api/client';
import { components } from '@/types/openapi.schema';
import {
  BookOpen,
  Calendar,
  ChevronDown,
  Edit2,
  Menu as MenuIcon,
  Plus,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useMemo } from 'react';
import { SearchInput } from './searchInput';
import { UserPlaceholder } from './UserPlaceholder';

export default function Sidebar() {
  const router = useRouter();
  const { semester: semId, course: crsId, lecture: lecId } = useParams();

  // depth: 0 = home, 1 = semester, 2 = course, 3 = lecture
  const depth = useMemo(() => {
    if (lecId) return 3;
    if (crsId) return 2;
    if (semId) return 1;
    return 0;
  }, [semId, crsId, lecId]);

  return (
    <aside className="flex h-full w-60 flex-col border-r bg-white">
      <div className="flex items-center justify-between p-4">
        <span className="text-lg font-bold">Study AID</span>
        <button className="rounded p-1 hover:bg-gray-100">
          <MenuIcon size={20} />
        </button>
      </div>
      <div className="mb-4 px-4">
        <UserPlaceholder />
      </div>
      <div className="mb-4 px-4">
        <SearchInput placeholder="검색..." />
      </div>

      <SemesterList
        depth={depth}
        activeSem={semId || null}
        activeCourse={crsId || null}
        activeLecture={lecId || null}
      />
    </aside>
  );
}

interface SemesterListProps {
  depth: number;
  activeSem: string | null;
  activeCourse: string | null;
  activeLecture: string | null;
}

function SemesterList({
  depth,
  activeSem,
  activeCourse,
  activeLecture,
}: SemesterListProps) {
  const router = useRouter();
  const { data } = api.useQuery('get', '/v1/semesters');
  const semesters = data?.semesters || [];

  const list =
    depth >= 2 && activeSem
      ? semesters.filter((s) => s.id === activeSem)
      : semesters;

  return (
    <div className="flex-1 overflow-y-auto px-2">
      {list.map((sem) => {
        const isActiveSem = sem.id === activeSem;
        return (
          <div key={sem.id} className="mb-2">
            <div
              className={`flex cursor-pointer items-center justify-between rounded-md px-3 py-2 ${isActiveSem ? 'bg-[#5971E7] text-white opacity-[73]' : 'bg-white hover:bg-gray-100'} `}
              onClick={() => router.push(isActiveSem ? '/' : `/${sem.id}`)}
            >
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span className="truncate font-medium">{sem.name}</span>
              </div>
              <ChevronDown
                size={20}
                className={`transition-transform ${isActiveSem ? 'rotate-180' : ''}`}
              />
            </div>

            {isActiveSem && (
              <CourseList
                semesterId={sem.id}
                activeCourse={activeCourse}
                activeLecture={activeLecture}
                depth={depth}
              />
            )}
          </div>
        );
      })}

      <button
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-[#5971E7] py-2 text-white opacity-[73] hover:opacity-90"
        onClick={() => router.push('/create/semester')}
      >
        <Plus size={18} />
        <span>학기 추가</span>
      </button>
    </div>
  );
}

interface CourseListProps {
  semesterId: string;
  activeCourse: string | null;
  activeLecture: string | null;
  depth: number;
}

function CourseList({
  semesterId,
  activeCourse,
  activeLecture,
  depth,
}: CourseListProps) {
  const router = useRouter();
  const { data } = api.useQuery('get', '/v1/courses/semester/{semesterId}', {
    params: { path: { semesterId } },
  });
  const courses = data?.courses || [];

  return (
    <div className="mt-2 space-y-1 pl-6">
      {courses.map((course) => {
        const isActiveCourse = course.id === activeCourse;
        return (
          <div key={course.id}>
            <div
              className={`flex cursor-pointer items-center justify-between rounded-md px-2 py-1 ${isActiveCourse ? 'bg-indigo-50 font-semibold text-indigo-700' : 'bg-white hover:bg-gray-100'} `}
            >
              <button
                className="flex w-full items-center gap-2 truncate text-sm"
                onClick={() => router.push(`/${semesterId}/${course.id}`)}
              >
                <BookOpen size={16} />
                {course.name}
              </button>
              <Edit2
                size={16}
                className="p-1 hover:text-gray-600"
                onClick={() => {
                  // TODO: implement course edit
                }}
              />
            </div>

            {isActiveCourse && depth >= 2 && (
              <LectureList
                semesterId={semesterId}
                courseId={course.id}
                activeLecture={activeLecture}
              />
            )}
          </div>
        );
      })}

      <button
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-indigo-50 py-1 text-sm text-indigo-700 hover:bg-indigo-100"
        onClick={() => router.push(`/create/course?semesterId=${semesterId}`)}
      >
        <Plus size={16} />
        <span>과목 추가</span>
      </button>
    </div>
  );
}

interface LectureListProps {
  semesterId: string;
  courseId: string;
  activeLecture: string | null;
}

function LectureList({
  semesterId,
  courseId,
  activeLecture,
}: LectureListProps) {
  const router = useRouter();
  const { data } = api.useQuery('get', '/v1/lectures/course/{courseId}', {
    params: { path: { courseId } },
  });
  const lectures = data?.lectures || [];

  return (
    <div className="mt-1 space-y-1 pl-8">
      {lectures.map((lec) => {
        const isActiveLec = lec.id === activeLecture;
        return (
          <div
            key={lec.id}
            className={`flex cursor-pointer items-center rounded-md px-2 py-1 ${isActiveLec ? 'bg-indigo-100 font-medium text-indigo-800' : 'bg-white hover:bg-gray-100'} `}
            onClick={() => router.push(`/${semesterId}/${courseId}/${lec.id}`)}
          >
            <span className="truncate text-sm">{lec.title}</span>
          </div>
        );
      })}

      <button
        className="mt-1 flex w-full items-center justify-center gap-2 rounded-md bg-indigo-100 py-1 text-sm text-indigo-800 hover:bg-indigo-200"
        onClick={() => router.push(`/create/lecture?courseId=${courseId}`)}
      >
        <Plus size={14} />
        <span>강의 추가</span>
      </button>
    </div>
  );
}
