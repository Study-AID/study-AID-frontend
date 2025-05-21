'use client';

import { api } from '@/api/client';
import { useParams, usePathname } from 'next/navigation';
import React, { useEffect, useMemo } from 'react';

interface HeaderProps {
  date: string;
  semesterLabel: string;
}

const SemesterLabel = ({ semesterId }: { semesterId: string }) => {
  const { data, isLoading, error } = api.useQuery('get', '/v1/semesters/{id}', {
    params: {
      path: {
        id: semesterId,
      },
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;
  if (!data) return <div>No data</div>;

  return <div>{data.name}</div>;
};

const CourseLabel = ({ courseId }: { courseId: string }) => {
  const { data, isLoading, error } = api.useQuery('get', '/v1/courses/{id}', {
    params: {
      path: {
        id: courseId,
      },
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;
  if (!data) return <div>No data</div>;

  return <div>{data.name}</div>;
};

const LectureLabel = ({ lectureId }: { lectureId: string }) => {
  const { data, isLoading, error } = api.useQuery('get', '/v1/lectures/{id}', {
    params: {
      path: {
        id: lectureId,
      },
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;
  if (!data) return <div>No data</div>;

  return <div>{data.title}</div>;
};

const Header: React.FC = () => {
  const params = useParams();

  const semesterId = params.semester;
  const courseId = params.course;
  const lectureId = params.lecture;

  const isDashboard = !semesterId;

  return (
    <div className="mb-4 border-b border-[#C4C4C4] bg-[#EFEFEF] px-6 py-4 font-medium">
      {isDashboard ? (
        <div className="mb-2 text-2xl">대시보드</div>
      ) : (
        <div className="mb-2 flex items-center gap-x-2 text-2xl">
          {/* 학기 */}
          {semesterId && <SemesterLabel semesterId={semesterId as string} />}

          {/* 과목 */}
          {courseId && (
            <>
              <span>&gt;</span>
              <CourseLabel courseId={courseId as string} />
            </>
          )}

          {/* 강의 */}
          {lectureId && (
            <>
              <span>&gt;</span>
              <LectureLabel lectureId={lectureId as string} />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Header;
