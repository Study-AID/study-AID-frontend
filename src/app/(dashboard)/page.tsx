'use client';

import { api } from '@/api/client';
import { components } from '@/types/openapi.schema';
import { useQueryClient } from '@tanstack/react-query';
import { Edit2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { string } from 'zod';

interface SemesterCardProps {
  semester?: components['schemas']['SemesterResponse'];
  isAdd?: boolean;
  label?: string;
  isEditing?: boolean;
  draftDisplay?: string;
  onStartEdit?: (semesterId: string, currentTitle: string) => void;
  onSave?: (semesterId: string, newTitle: string) => void;
  onCancel?: () => void;
  onClick?: () => void;
}

function SemesterCard({
  semester,
  isAdd = false,
  label,
  isEditing,
  draftDisplay,
  onStartEdit,
  onSave,
  onCancel,
  onClick,
}: SemesterCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // 실제 display 텍스트 영역
  const Display = () =>
    isEditing && draftDisplay !== undefined ? (
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          className="inline-block w-max max-w-[12ch] min-w-[4ch] border-b border-gray-400 bg-transparent p-1 text-xl font-semibold focus:outline-none"
          defaultValue={draftDisplay}
          onBlur={(e) => {
            onSave!(semester!.id!, e.currentTarget.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSave!(semester!.id!, e.currentTarget.value);
              inputRef.current?.blur();
            }
            if (e.key === 'Escape') {
              onCancel?.();
            }
          }}
        />
      </div>
    ) : (
      <span className="text-xl font-semibold">
        {isAdd ? <Plus size={48} /> : semester?.name}
      </span>
    );

  return (
    <div
      onClick={onClick}
      className={`relative flex h-56 w-44 cursor-pointer flex-col overflow-hidden rounded-lg shadow-md transition hover:shadow-xl ${isAdd ? 'bg-black/65 text-white' : 'border border-[#D0D0D0] bg-[#F9F9F9]'} `}
    >
      <div className="flex flex-1 items-center justify-center">
        {isAdd ? <Plus size={48} /> : <Display />}
      </div>

      {!isAdd && !isEditing && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStartEdit!(semester!.id!, semester!.name!);
          }}
          className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700"
        >
          <Edit2 size={16} />
        </button>
      )}

      <div
        className={`flex h-12 items-center justify-center text-sm font-medium ${
          isAdd
            ? 'bg-opacity-30 bg-black/30'
            : 'border border-[#D3D3D3] bg-[#ECECEC] text-gray-700'
        } `}
      >
        {isAdd ? label : `3 Classes`}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading, error } = api.useQuery('get', '/v1/semesters');
  const router = useRouter();
  const utils = useQueryClient();

  // 날짜 및 학기 정보
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const month = today.getMonth() + 1;
  // 3 ~ 6 : Spring, 7 ~ 8 : Summer, 9 ~ 12 : Fall, 1 ~ 2 : Winter
  const semesterLabel =
    month >= 3 && month <= 6
      ? 'SPRING'
      : month >= 9 && month <= 12
        ? 'FALL'
        : month >= 1 && month <= 2
          ? 'WINTER'
          : 'SUMMER';
  const headerText = `${yyyy}.${mm}.${dd}`;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftDisplay, setDraftDisplay] = useState('');

  const updateSemester = api.useMutation('put', '/v1/semesters/{id}', {
    onSuccess: (data) => {
      utils.invalidateQueries({ queryKey: ['get', '/v1/semesters'] });
      setEditingId(null);
    },
  });

  if (!data || isLoading) {
    return <div>Loading...</div>;
  }

  if (error) return `An error occured: ${error}`;

  const startEdit = (semesterId: string, currentTitle: string) => {
    setEditingId(semesterId);
    setDraftDisplay(currentTitle);
  };
  const cancelEdit = () => setEditingId(null);

  const onSave = (semesterId: string, newTitle: string) => {
    if (draftDisplay === '') {
      return;
    }
    updateSemester.mutate({
      params: {
        path: {
          id: semesterId,
        },
      },
      body: {
        name: newTitle,
      },
    });
  };

  return (
    <div className="w-full p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#5E5E5E]">
          {headerText}{' '}
          <span className="text-lg font-bold">
            ({`${yyyy}년 ${semesterLabel} 학기`})
          </span>
        </h1>
        <button
          onClick={() => router.push('/create/semester')}
          className="cursor-pointer rounded-full p-2 transition hover:bg-gray-200"
          aria-label="학기 추가"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* 학기 카드 그리드 */}
      <div className="flex flex-wrap gap-3">
        {data?.semesters?.map((s) => (
          <SemesterCard
            key={s.id}
            semester={s}
            isEditing={editingId === s.id}
            draftDisplay={draftDisplay}
            onStartEdit={startEdit}
            onSave={onSave}
            onCancel={cancelEdit}
            onClick={() => router.push(`/${s.id}`)}
          />
        ))}
        <SemesterCard
          isAdd
          label="현재 학기 추가하기"
          onClick={() =>
            router.push(
              `/create/semester?season=${semesterLabel}&year=${yyyy}&name=${yyyy}-${semesterLabel}`,
            )
          }
        />
        <SemesterCard
          isAdd
          label="새 학기 추가하기"
          onClick={() => router.push('/create/semester')}
        />
      </div>
    </div>
  );
}
