'use client';

import { components } from '@/types/openapi.schema';
import { Edit2, Plus } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function CourseCard({
  course,
  onStartEdit,
  onClick,
}: {
  course: components['schemas']['CourseResponse'];
  onStartEdit: (courseId: string, currentTitle: string) => void;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`relative flex h-56 w-44 cursor-pointer flex-col overflow-hidden rounded-lg border border-[#D0D0D0] bg-[#F9F9F9] shadow-md transition hover:shadow-xl`}
    >
      <div className="flex flex-1 items-center justify-center">
        <span className="text-xl font-semibold">{course.name}</span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();

          const name = course.name;
          onStartEdit!(course.id, name);
        }}
        className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700"
      >
        <Edit2 size={16} />
      </button>

      <div
        className={`flex h-12 items-center justify-center border border-[#D3D3D3] bg-[#ECECEC] text-sm font-medium text-gray-700`}
      >
        {/* 수정해야함 */}3 Classes
      </div>
    </div>
  );
}

export function AddCourseCard({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="relative flex h-56 w-44 cursor-pointer flex-col overflow-hidden rounded-lg bg-black/65 text-white shadow-md transition hover:shadow-xl"
    >
      <div className="flex flex-1 items-center justify-center">
        <Plus size={48} />
      </div>

      <div className="bg-opacity-30 flex h-12 items-center justify-center bg-black/30 text-sm font-medium">
        새 과목 추가
      </div>
    </div>
  );
}
