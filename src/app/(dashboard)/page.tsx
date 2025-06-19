'use client';

import { api } from '@/api/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/component/ui/dialog';
import { Input } from '@/component/ui/input';
import { Label } from '@/component/ui/label';
import { components } from '@/types/openapi.schema';
import { useQueryClient } from '@tanstack/react-query';
import { Edit2, Plus, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { string } from 'zod';

interface SemesterCardProps {
  semester?: components['schemas']['SemesterResponse'];
  isAdd?: boolean;
  label?: string;
  onStartEdit?: (
    semesterId: string,
    currentTitle: string,
    currentYear: number,
    currentSeason: string,
  ) => void;
  onClick?: () => void;
}

function SemesterCard({
  semester,
  isAdd = false,
  label,
  onStartEdit,
  onClick,
}: SemesterCardProps) {
  return (
    <div
      onClick={onClick}
      className={`relative flex h-56 w-44 cursor-pointer flex-col overflow-hidden rounded-lg shadow-md transition hover:shadow-xl ${isAdd ? 'bg-black/65 text-white' : 'border border-[#D0D0D0] bg-[#F9F9F9]'} `}
    >
      <div className="flex flex-1 items-center justify-center">
        <span className="text-xl font-semibold">
          {isAdd ? <Plus size={48} /> : semester?.name}
        </span>
      </div>

      {!isAdd && (
        <button
          onClick={(e) => {
            e.stopPropagation();

            const name = semester!.name;
            const year = semester!.year;
            const season = semester!.season;
            onStartEdit!(semester!.id!, name, year, season);
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

// 학기 제목 편집 모달 컴포넌트
function EditSemesterModal({
  isOpen,
  onClose,
  semesterId,
  currentYear,
  currentSeason,
  currentTitle,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  semesterId: string;
  currentTitle: string;
  currentYear: number;
  currentSeason: string;
  onSave: (
    semesterId: string,
    newTitle: string,
    newYear: number,
    newSeason: string,
  ) => void;
}) {
  const [title, setTitle] = useState(currentTitle);
  const [year, setYear] = useState(currentYear);
  const [season, setSeason] = useState(currentSeason);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(currentTitle);
      setYear(currentYear);
      setSeason(currentSeason);
    }
  }, [isOpen, currentTitle, currentYear, currentSeason]);

  const handleSave = async () => {
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      onSave(semesterId, title.trim(), year, season);
      onClose();
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTitle(currentTitle);
    setYear(currentYear);
    setSeason(currentSeason);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>학기 정보 수정</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="semester-title" className="text-sm font-medium">
              학기 제목
            </Label>
            <Input
              id="semester-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="학기 제목을 입력하세요"
              className="mt-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                } else if (e.key === 'Escape') {
                  handleCancel();
                }
              }}
            />
          </div>

          <div>
            <Label htmlFor="semester-year" className="text-sm font-medium">
              연도
            </Label>
            <Input
              id="semester-year"
              type="number"
              value={year}
              onChange={(e) =>
                setYear(
                  Number.parseInt(e.target.value) || new Date().getFullYear(),
                )
              }
              placeholder="연도를 입력하세요"
              className="mt-1"
              min="2000"
              max="2100"
            />
          </div>

          <div>
            <Label htmlFor="semester-season" className="text-sm font-medium">
              학기
            </Label>
            <select
              id="semester-season"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="border-input bg-background ring-offset-background focus:ring-ring mt-1 flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
            >
              <option value="SPRING">봄학기 (SPRING)</option>
              <option value="SUMMER">여름학기 (SUMMER)</option>
              <option value="FALL">가을학기 (FALL)</option>
              <option value="WINTER">겨울학기 (WINTER)</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isSaving}
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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

  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    semesterId: string;
    currentTitle: string;
    currentYear: number;
    currentSeason: string;
  }>({
    isOpen: false,
    semesterId: '',
    currentTitle: '',
    currentYear: yyyy,
    currentSeason: '',
  });

  const updateSemester = api.useMutation('put', '/v1/semesters/{id}');

  if (!data || isLoading) {
    return <div>Loading...</div>;
  }

  if (error) return `An error occured: ${error}`;

  const startEdit = (
    semesterId: string,
    currentTitle: string,
    currentYear: number,
    currentSeason: string,
  ) => {
    setEditModal({
      isOpen: true,
      semesterId,
      currentTitle,
      currentYear,
      currentSeason,
    });
  };

  const closeEditModal = () => {
    setEditModal({
      isOpen: false,
      semesterId: '',
      currentTitle: '',
      currentYear: yyyy,
      currentSeason: '',
    });
  };

  const onSave = (
    semesterId: string,
    newTitle: string,
    newYear: number,
    season: string,
  ) => {
    // if same title, just close modal
    if (newTitle === editModal.currentTitle) {
      closeEditModal();
      return;
    }
    // if title is empty, do not update
    if (!newTitle.trim()) {
      return;
    }

    updateSemester.mutate(
      {
        params: {
          path: {
            id: semesterId,
          },
        },
        body: {
          name: newTitle,
          year: newYear,
          season: season,
        },
      },
      {
        onSuccess: () => {
          utils.setQueryData(
            ['get', '/v1/semesters'],
            (oldData: components['schemas']['SemesterListResponse']) => {
              if (!oldData || !oldData.semesters) {
                return oldData;
              }
              return {
                semesters: oldData.semesters.map((s) => {
                  if (s.id === semesterId) {
                    return {
                      ...s,
                      name: newTitle,
                    };
                  }
                  return s;
                }) as components['schemas']['SemesterResponse'][],
              };
            },
          );
          closeEditModal();
        },
      },
    );
  };

  return (
    <div className="relative w-full p-8">
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
            onStartEdit={startEdit}
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
      <EditSemesterModal
        isOpen={editModal.isOpen}
        onClose={closeEditModal}
        semesterId={editModal.semesterId}
        currentTitle={editModal.currentTitle}
        currentYear={editModal.currentYear}
        currentSeason={editModal.currentSeason}
        onSave={onSave}
      />
    </div>
  );
}
