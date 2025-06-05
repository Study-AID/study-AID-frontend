'use client';

import { api } from '@/api/client';
import { components } from '@/types/openapi.schema';
import {
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit2,
  Menu,
  Menu as MenuIcon,
  PanelLeftClose,
  PanelRightOpen,
  Plus,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { SearchInput } from './searchInput';
import { Button } from './ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import { UserPlaceholder } from './UserPlaceholder';

export default function Sidebar() {
  const { semester: semId, course: crsId, lecture: lecId } = useParams();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // depth: 0 = home, 1 = semester, 2 = course, 3 = lecture
  const depth = useMemo(() => {
    if (lecId) return 3;
    if (crsId) return 2;
    if (semId) return 1;
    return 0;
  }, [semId, crsId, lecId]);

  return (
    <div
      className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} relative flex h-full min-h-screen flex-col overflow-visible border-r border-[#e6e6e6] bg-white transition-all duration-300 ease-in-out`}
    >
      <div className="flex items-center justify-between border-b border-[#e6e6e6] px-3 py-2.5 text-xl">
        {!isSidebarCollapsed && (
          <h1 className="font-semibold text-[#1d1b20]">Study AID</h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="ml-auto text-[#757575] hover:bg-[#f5f5f5]"
        >
          {isSidebarCollapsed ? (
            <PanelRightOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>

      {!isSidebarCollapsed && (
        <div className="border-b border-[#e6e6e6] px-4 py-2">
          <UserPlaceholder />
        </div>
      )}

      {!isSidebarCollapsed && (
        <div className="p-4">
          <SearchInput placeholder="검색..." />
        </div>
      )}

      {!isSidebarCollapsed && (
        <SemesterList
          depth={depth}
          activeSem={(semId as string) || null}
          activeCourse={(crsId as string) || null}
          activeLecture={(lecId as string) || null}
        />
      )}
    </div>
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
    <div className="px-4">
      <div className="space-y-2">
        {list.map((sem) => {
          const isActiveSem = sem.id === activeSem;
          return (
            <Collapsible
              open={isActiveSem}
              onOpenChange={() => router.push(isActiveSem ? '/' : `/${sem.id}`)}
              key={sem.id}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 rounded-lg border border-[#e6e6e6] p-3 font-medium text-[#1d1b20] shadow-sm transition-all duration-200 hover:border-[#d1d5db] hover:bg-[#f8f9fa] hover:shadow-md"
                >
                  <Calendar className="h-4 w-4 text-[#5971e7]" />
                  <span>{sem.name}</span>
                  {isActiveSem ? (
                    <ChevronUp className="ml-auto h-4 w-4 text-[#757575] transition-transform duration-200" />
                  ) : (
                    <ChevronDown className="ml-auto h-4 w-4 text-[#757575] transition-transform duration-200" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="ml-6 space-y-1 overflow-hidden transition-all duration-500 ease-in-out">
                <CourseList
                  semesterId={sem.id}
                  activeCourse={activeCourse}
                  activeLecture={activeLecture}
                  depth={depth}
                />
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>

      {depth < 2 && (
        <button
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-[#5971E7] py-2 text-white opacity-[73] hover:opacity-90"
          onClick={() => router.push('/create/semester')}
        >
          <Plus size={18} />
          <span>학기 추가</span>
        </button>
      )}
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

  if (depth < 2) {
    return (
      <div className="mt-2 space-y-1 pl-2">
        {courses.map((course) => {
          return (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 rounded-lg border border-[#e6e6e6] p-3 font-medium text-[#1d1b20] shadow-sm transition-all duration-200 hover:border-[#d1d5db] hover:bg-[#f8f9fa] hover:shadow-md"
              key={course.id}
              onClick={() => router.push(`/${semesterId}/${course.id}`)}
            >
              <BookOpen className="h-4 w-4 text-[#5971e7]" />
              <span>{course.name}</span>
            </Button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-1 pl-2">
      {courses.map((course) => {
        const isActiveCourse = course.id === activeCourse;
        return (
          <Collapsible
            open={isActiveCourse}
            onOpenChange={() =>
              router.push(isActiveCourse ? '/' : `/${semesterId}/${course.id}`)
            }
            key={course.id}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 rounded-lg border border-[#e6e6e6] p-3 font-medium text-[#1d1b20] shadow-sm transition-all duration-200 hover:border-[#d1d5db] hover:bg-[#f8f9fa] hover:shadow-md"
              >
                <BookOpen className="h-4 w-4 text-[#5971e7]" />
                <span>{course.name}</span>
                {isActiveCourse ? (
                  <ChevronUp className="ml-auto h-4 w-4 text-[#757575] transition-transform duration-200" />
                ) : (
                  <ChevronDown className="ml-auto h-4 w-4 text-[#757575] transition-transform duration-200" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="ml-6 space-y-1 overflow-hidden transition-all duration-500 ease-in-out">
              <LectureList
                semesterId={semesterId}
                courseId={course.id}
                activeLecture={activeLecture}
              />
            </CollapsibleContent>
          </Collapsible>
        );
      })}

      <button
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-[#5971E7] py-1 text-white opacity-[73] hover:opacity-90"
        onClick={() => router.push(`/create/course?semesterId=${semesterId}`)}
      >
        <Plus size={18} />
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
    <div className="mt-1 space-y-1 pl-2">
      {lectures.map((lec) => {
        const isActiveLec = lec.id === activeLecture;
        return (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 rounded-lg border border-[#e6e6e6] p-3 font-medium text-[#1d1b20] shadow-sm transition-all duration-200 hover:border-[#d1d5db] hover:bg-[#f8f9fa] hover:shadow-md"
            key={lec.id}
            onClick={() =>
              router.push(
                isActiveLec
                  ? `/${semesterId}/${courseId}`
                  : `/${semesterId}/${courseId}/${lec.id}`,
              )
            }
          >
            <Calendar className="h-4 w-4 text-[#5971e7]" />
            <span>{lec.title}</span>
          </Button>
        );
      })}

      <button
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-[#5971E7] py-1 text-white opacity-[73] hover:opacity-90"
        onClick={() => router.push(`/create/lecture?courseId=${courseId}`)}
      >
        <Plus size={18} />
        <span>강의 추가</span>
      </button>
    </div>
  );
}
