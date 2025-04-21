import React from 'react';

interface SemesterCardProps {
  title: string;
  classesCount?: number;
  isAddCard: boolean;
  addText?: string;
}

export default function SemesterCard({
  title,
  classesCount,
  isAddCard,
  addText = '추가하기',
}: SemesterCardProps) {
  return (
    <div
      className={`flex h-48 w-64 cursor-pointer flex-col items-center justify-center rounded-lg p-6 ${
        isAddCard ? 'bg-gray-700' : 'bg-gray-100'
      }`}
    >
      {isAddCard ? (
        <>
          <div className="mb-2 text-4xl text-white">+</div>
          <div className="text-white">
            {title} {addText}
          </div>
        </>
      ) : (
        <>
          <div className="mb-4 text-2xl font-bold">{title}</div>
          <div className="text-gray-600">{classesCount} Classes</div>
        </>
      )}
    </div>
  );
}
