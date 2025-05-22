'use client';

import { components } from '@/types/openapi.schema';
import { Edit2, Plus } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function QuizCard({
  quiz,
  onClick,
}: {
  quiz: components['schemas']['QuizResponse'];
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="relative flex h-56 w-44 cursor-pointer flex-col overflow-hidden rounded-lg border border-[#D0D0D0] bg-[#F9F9F9] shadow-md transition hover:shadow-xl"
    >
      <div className="flex flex-1 items-center justify-center">
        <span className="text-xl font-semibold">{quiz.title}</span>
      </div>

      {/* <div
        className={flex h-12 items-center justify-center text-sm font-medium border border-[#D3D3D3] bg-[#ECECEC] text-gray-700}
      >
        {course.code}
      </div> */}
    </div>
  );
}

export function AddQuizCard({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="relative flex h-56 w-44 cursor-pointer flex-col overflow-hidden rounded-lg bg-black/65 text-white shadow-md transition hover:shadow-xl"
    >
      <div className="flex flex-1 items-center justify-center">
        <Plus size={48} />
      </div>

      <div className="bg-opacity-30 flex h-12 items-center justify-center bg-black/30 text-sm font-medium">
        새 퀴즈 추가
      </div>
    </div>
  );
}
