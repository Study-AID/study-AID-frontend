'use client';

import { components } from '@/types/openapi.schema';
import { Edit2, Plus } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function CourseCard({
  course,
  isEditing,
  draftDisplay,
  onStartEdit,
  onSave,
  onCancel,
  onClick,
}: {
  course: components['schemas']['CourseResponse'];
  isEditing: boolean;
  draftDisplay: string;
  onStartEdit: (courseId: string, currentTitle: string) => void;
  onSave: (courseId: string, newTitle: string) => void;
  onCancel: () => void;
  onClick: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const Display = () =>
    isEditing && draftDisplay !== undefined ? (
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          className="inline-block w-max max-w-[12ch] min-w-[4ch] border-b border-gray-400 bg-transparent p-1 text-xl font-semibold focus:outline-none"
          defaultValue={draftDisplay}
          onBlur={(e) => {
            onSave!(course.id, e.currentTarget.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSave!(course.id, e.currentTarget.value);
              inputRef.current?.blur();
            }
            if (e.key === 'Escape') {
              onCancel?.();
            }
          }}
        />
      </div>
    ) : (
      <span className="text-xl font-semibold">{course.name}</span>
    );
  return (
    <div
      onClick={onClick}
      className="relative flex h-56 w-44 cursor-pointer flex-col overflow-hidden rounded-lg border border-[#D0D0D0] bg-[#F9F9F9] shadow-md transition hover:shadow-xl"
    >
      <div className="flex flex-1 items-center justify-center">
        <Display />
      </div>

      {!isEditing && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStartEdit!(course.id, course.name);
          }}
          className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700"
        >
          <Edit2 size={16} />
        </button>
      )}

      {/* <div
        className={flex h-12 items-center justify-center text-sm font-medium border border-[#D3D3D3] bg-[#ECECEC] text-gray-700}
      >
        {course.code}
      </div> */}
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
