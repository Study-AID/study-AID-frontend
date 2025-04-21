'use client';

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { Edit2, Plus } from 'lucide-react';
import React, { Fragment, useEffect, useRef, useState } from 'react';

interface Semester {
  id: string;
  display: string;
  classCount: number;
}

const initialSemesters: Semester[] = [
  { id: '2024-2', display: '2024-2', classCount: 3 },
  { id: '2024-1', display: '2024-1', classCount: 3 },
];

interface SemesterCardProps {
  semester?: Semester;
  isAdd?: boolean;
  label?: string;
  isEditing?: boolean;
  draftDisplay?: string;
  onStartEdit?: () => void;
  onChange?: (v: string) => void;
  onSave?: (newValue: string) => void;
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
  onChange,
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
            onSave?.(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSave?.(e.currentTarget.value);
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
        {isAdd ? <Plus size={48} /> : semester?.display}
      </span>
    );

  return (
    <div
      onClick={isAdd ? onClick : undefined}
      className={`relative flex h-56 w-44 cursor-pointer flex-col overflow-hidden rounded-lg shadow-md transition hover:shadow-xl ${isAdd ? 'bg-black/65 text-white' : 'border border-[#D0D0D0] bg-[#F9F9F9]'} `}
    >
      <div className="flex flex-1 items-center justify-center">
        {isAdd ? <Plus size={48} /> : <Display />}
      </div>

      {!isAdd && !isEditing && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStartEdit?.();
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
        {isAdd ? label : `${semester?.classCount} Classes`}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  // 날짜 및 학기 정보
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const month = today.getMonth() + 1;
  // 3 ~ 6 : Spring, 7 ~ 8 : Summer, 9 ~ 12 : Fall, 1 ~ 2 : Winter
  const semesterLabel =
    month >= 3 && month <= 6
      ? 'Spring'
      : month >= 9 && month <= 12
        ? 'Fall'
        : month >= 1 && month <= 2
          ? 'Winter'
          : 'Summer';
  const headerText = `${yyyy}.${mm}.${dd}`;
  const [semesters, setSemesters] = useState<Semester[]>(initialSemesters);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftDisplay, setDraftDisplay] = useState('');

  // 모달 상태 및 선택값
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(yyyy);
  const [selectedTerm, setSelectedTerm] = useState<
    'Spring' | 'Fall' | 'Summer' | 'Winter'
  >(semesterLabel as 'Spring' | 'Fall' | 'Summer' | 'Winter');

  // 연도 옵션 (전후 1년)
  const yearOptions = [yyyy - 1, yyyy, yyyy + 1];

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleAdd = () => {
    // TODO: 학기 추가 API 호출 or 상태 업데이트
    console.log(`Add semester: ${selectedYear}-${selectedTerm}`);
    closeModal();
  };

  const startEdit = (s: Semester) => {
    setEditingId(s.id);
    setDraftDisplay(s.display);
  };
  const cancelEdit = () => setEditingId(null);

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
          onClick={openModal}
          className="cursor-pointer rounded-full p-2 transition hover:bg-gray-200"
          aria-label="학기 추가"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* 학기 카드 그리드 */}
      <div className="grid grid-cols-7 gap-6">
        {semesters.map((s) => (
          <SemesterCard
            key={s.id}
            semester={s}
            isEditing={editingId === s.id}
            draftDisplay={draftDisplay}
            onStartEdit={() => startEdit(s)}
            onChange={(v) => setDraftDisplay(v)}
            onSave={(newDisplay) => {
              setSemesters(
                semesters.map((s) =>
                  s.id === editingId ? { ...s, display: newDisplay } : s,
                ),
              );
              setEditingId(null);
            }}
            onCancel={cancelEdit}
          />
        ))}
        <SemesterCard isAdd label="현재 학기 추가하기" onClick={openModal} />
        <SemesterCard isAdd label="새 학기 추가하기" onClick={openModal} />
      </div>

      {/* 학기 추가 모달 */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="bg-opacity-30 fixed inset-0 bg-black/30" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <DialogTitle
                    as="h3"
                    className="text-lg leading-6 font-semibold"
                  >
                    학기 추가하기
                  </DialogTitle>
                  <div className="mt-4 flex gap-4">
                    <select
                      className="flex-1 rounded border border-gray-300 p-2"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                    >
                      {yearOptions.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                    <select
                      className="flex-1 rounded border border-gray-300 p-2"
                      value={selectedTerm}
                      onChange={(e) =>
                        setSelectedTerm(e.target.value as 'Spring' | 'Fall')
                      }
                    >
                      <option value="Spring">Spring</option>
                      <option value="Fall">Fall</option>
                    </select>
                  </div>

                  <div className="mt-6">
                    <input
                      type="text"
                      value={`${selectedYear}-${selectedTerm}`}
                      className="w-full rounded border border-gray-300 bg-white p-2"
                    />
                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      type="button"
                      className="rounded bg-gray-200 px-4 py-2"
                      onClick={closeModal}
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      className="rounded bg-blue-600 px-4 py-2 text-white"
                      onClick={handleAdd}
                    >
                      추가
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
