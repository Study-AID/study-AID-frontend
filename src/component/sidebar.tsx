'use client';

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
import React, { useEffect, useRef, useState } from 'react';
import { SearchInput } from './searchInput';
import { UserPlaceholder } from './UserPlaceholder';

interface Course {
  id: string;
  name: string;
}
interface Semester {
  id: string;
  label: string;
  courses: Course[];
}

const initialSemesters: Semester[] = [
  {
    id: '2024-1',
    label: '2024-1',
    courses: [
      { id: 'course-1', name: '수학2' },
      { id: 'course-2', name: '머신러닝' },
      { id: 'course-3', name: '자료구조' },
    ],
  },
  {
    id: '2024-2',
    label: '2024-2',
    courses: [
      { id: 'course-4', name: '알고리즘' },
      { id: 'course-5', name: '분산시스템' },
      { id: 'course-6', name: '캡스톤 디자인' },
    ],
  },
];

export default function Sidebar() {
  const [semesters, setSemesters] = useState(initialSemesters);

  const [editingSemId, setEditingSemId] = useState<string | null>(null);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [editingSemId, editingCourseId]);

  const saveSemesterLabel = (id: string) => {
    setSemesters(
      semesters.map((s) =>
        s.id === id ? { ...s, label: draftValue || s.label } : s,
      ),
    );
    setEditingSemId(null);
  };

  const saveCourseName = (semId: string, courseId: string) => {
    setSemesters(
      semesters.map((s) =>
        s.id !== semId
          ? s
          : {
              ...s,
              courses: s.courses.map((c) =>
                c.id === courseId ? { ...c, name: draftValue || c.name } : c,
              ),
            },
      ),
    );
    setEditingCourseId(null);
  };

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

      <div className="flex- h-fit space-y-2 overflow-y-auto">
        {semesters.map((sem) => (
          <Disclosure key={sem.id} defaultOpen>
            {({ open }) => (
              <div className="rounded-lg border border-gray-200">
                <DisclosureButton className="flex w-full items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    {editingSemId === sem.id ? (
                      <input
                        ref={inputRef}
                        className="w-20 border-b border-gray-400 bg-transparent p-0 font-semibold focus:outline-none"
                        value={draftValue}
                        onChange={(e) => setDraftValue(e.target.value)}
                        onBlur={() => saveSemesterLabel(sem.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveSemesterLabel(sem.id);
                          if (e.key === 'Escape') setEditingSemId(null);
                        }}
                      />
                    ) : (
                      <span className="font-semibold">{sem.label}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* 편집 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDraftValue(sem.label);
                        setEditingSemId(sem.id);
                        setEditingCourseId(null);
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
                  {sem.courses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between"
                    >
                      <button className="flex items-center gap-2 rounded px-2 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-100">
                        <BookOpen size={16} />

                        {/* 강의명 or 편집 input */}
                        {editingCourseId === course.id ? (
                          <input
                            ref={inputRef}
                            className="w-20 border-b border-gray-400 bg-transparent p-0 text-sm focus:outline-none"
                            value={draftValue}
                            onChange={(e) => setDraftValue(e.target.value)}
                            onBlur={() => saveCourseName(sem.id, course.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter')
                                saveCourseName(sem.id, course.id);
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
                          setDraftValue(course.name);
                          setEditingCourseId(course.id);
                          setEditingSemId(null);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  ))}
                </DisclosurePanel>
              </div>
            )}
          </Disclosure>
        ))}
      </div>

      <button className="mt-4 flex items-center justify-center gap-2 rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700">
        <Plus size={24} />
      </button>
    </aside>
  );
}
