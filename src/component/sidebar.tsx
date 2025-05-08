'use client';

import { api } from '@/api/client';
import { components } from '@/types/openapi.schema';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import {
  BookOpen,
  Calendar,
  ChevronDown,
  Edit2,
  Menu as MenuIcon,
  Plus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SearchInput } from './searchInput';
import { UserPlaceholder } from './UserPlaceholder';

export default function Sidebar() {
  const router = useRouter();
  const { data: semestersData, isLoading: loadingSemesters } = api.useQuery(
    'get',
    '/v1/semesters',
  );

  const semesters = useMemo(() => {
    if (semestersData?.semesters && semestersData.semesters.length > 0) {
      return semestersData.semesters;
    }
    return null;
  }, [semestersData]);

  if (loadingSemesters) {
    return null;
  }

  return (
    <aside className="flex h-full w-60 flex-col border-r border-gray-200 bg-white p-4">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-xl font-bold italic">Study AID</span>
        <button className="rounded p-1 hover:bg-gray-100">
          <MenuIcon size={20} />
        </button>
      </div>

      <div className="mb-6">
        <UserPlaceholder />
      </div>

      <div className="mb-6">
        <SearchInput placeholder="강의 검색..." />
      </div>

      {semesters ? (
        semesters.map((sem) => <SemesterTab key={sem.id} semester={sem} />)
      ) : (
        <div className="flex h-full items-center justify-center">
          <span className="text-gray-500">등록된 학기가 없습니다.</span>
        </div>
      )}

      <button
        className="mt-4 flex items-center justify-center gap-2 rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700"
        onClick={() => {
          router.push('/create/semester');
        }}
      >
        <Plus size={24} />
      </button>
    </aside>
  );
}

function SemesterTab({
  semester,
}: {
  semester: components['schemas']['SemesterResponse'];
}) {
  const [editingSemId, setEditingSemId] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  const { data: coursesData, isLoading: loadingCourses } = api.useQuery(
    'get',
    '/v1/courses/semester/{semesterId}',
    {
      params: {
        path: {
          semesterId: semester.id!,
        },
      },
    },
  );

  const courses = useMemo(() => {
    if (coursesData?.courses && coursesData.courses.length > 0) {
      return coursesData.courses;
    }
    return null;
  }, [coursesData]);

  const semesterUpdate = api.useMutation('put', '/v1/semesters/{id}');

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [editingSemId]);

  if (loadingCourses) {
    return null;
  }

  const saveSemesterLabel = (id: string) => {
    if (draftValue) {
      semesterUpdate.mutate({
        params: {
          path: {
            id,
          },
        },
        body: {
          name: draftValue,
        },
      });
    }
    setEditingSemId(null);
  };

  return (
    <div className="flex- mb-3 h-fit space-y-2 overflow-y-auto">
      <Disclosure key={semester.id} defaultOpen>
        {({ open }) => (
          <div className="rounded-lg border border-gray-200">
            <DisclosureButton className="flex w-full items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                {editingSemId === semester.id ? (
                  <input
                    ref={inputRef}
                    className="w-20 border-b border-gray-400 bg-transparent p-0 font-semibold focus:outline-none"
                    value={draftValue}
                    onChange={(e) => setDraftValue(e.target.value)}
                    onBlur={() => saveSemesterLabel(semester.id!)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveSemesterLabel(semester.id!);
                      if (e.key === 'Escape') setEditingSemId(null);
                    }}
                  />
                ) : (
                  <span className="font-semibold">{semester.name}</span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {/* 편집 버튼 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDraftValue(semester.name!);
                    setEditingSemId(semester.id!);
                  }}
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  <Edit2 size={14} />
                </button>

                <ChevronDown
                  size={16}
                  className={`${open ? 'rotate-180' : ''} transform cursor-pointer transition-transform`}
                />
              </div>
            </DisclosureButton>

            <DisclosurePanel className="space-y-1 px-5 pb-2">
              {courses?.map((course) => (
                <CourseTab key={course.id} course={course} />
              )) ?? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    등록된 강의가 없습니다.
                  </span>
                </div>
              )}
            </DisclosurePanel>
          </div>
        )}
      </Disclosure>
    </div>
  );
}

function CourseTab({
  course,
}: {
  course: components['schemas']['CourseResponse'];
}) {
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const courseUpdate = api.useMutation('put', '/v1/courses/{id}');

  const saveCourseName = (semId: string, courseId: string) => {
    if (draftValue) {
      courseUpdate.mutate({
        params: {
          path: {
            id: courseId,
          },
        },
        body: {
          name: draftValue,
        },
      });
      setEditingCourseId(null);
    }
  };

  return (
    <div key={course.id} className="flex items-center justify-between">
      <button className="flex items-center gap-2 rounded px-2 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-100">
        <BookOpen size={16} />

        {/* 강의명 or 편집 input */}
        {editingCourseId === course.id ? (
          <input
            ref={inputRef}
            className="w-20 border-b border-gray-400 bg-transparent p-0 text-sm focus:outline-none"
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            onBlur={() => saveCourseName(course.semesterId!, course.id!)}
            onKeyDown={(e) => {
              if (e.key === 'Enter')
                saveCourseName(course.semesterId!, course.id!);
              if (e.key === 'Escape') setEditingCourseId(null);
            }}
          />
        ) : (
          <span>{course.name}</span>
        )}
      </button>

      {/* 강의 편집 버튼 */}
      <button
        onClick={() => {
          setDraftValue(course.name!);
          setEditingCourseId(course.id!);
        }}
        className="p-1 text-gray-400 hover:text-gray-600"
      >
        <Edit2 size={14} />
      </button>
    </div>
  );
}
