'use client';

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { Plus } from 'lucide-react';
import React, { Fragment, useState } from 'react';

interface Semester {
  id: string;
  display: string;
  classCount: number;
}

const semesters: Semester[] = [
  { id: '2024-2', display: '2024-2', classCount: 3 },
  { id: '2024-1', display: '2024-1', classCount: 3 },
];

interface SemesterCardProps {
  display?: string;
  classCount?: number;
  isAdd?: boolean;
  label?: string;
  onClick?: () => void;
}

function SemesterCard({
  display,
  classCount,
  isAdd = false,
  label,
  onClick,
}: SemesterCardProps) {
  return (
    <div
      onClick={onClick}
      className={`flex h-56 w-44 cursor-pointer flex-col overflow-hidden rounded-lg shadow-md transition hover:shadow-lg ${isAdd ? 'bg-gray-600 text-white' : 'bg-white'}`}
    >
      <div className="flex flex-1 items-center justify-center text-xl font-semibold">
        {isAdd ? <Plus size={48} /> : display}
      </div>
      <div
        className={`flex h-12 items-center justify-center text-sm font-medium ${isAdd ? 'bg-gray-800' : 'bg-gray-100 text-gray-700'}`}
      >
        {isAdd ? label : `${classCount} Classes`}
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
  const semesterLabel = month >= 3 && month <= 8 ? 'Spring' : 'Fall';
  const headerText = `${yyyy}.${mm}.${dd} (${yyyy}년도 ${semesterLabel === 'Spring' ? '1학기' : '2학기'})`;

  // 모달 상태 및 선택값
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(yyyy);
  const [selectedTerm, setSelectedTerm] = useState<'Spring' | 'Fall'>(
    semesterLabel,
  );

  // 연도 옵션 (전후 1년)
  const yearOptions = [yyyy - 1, yyyy, yyyy + 1];

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleAdd = () => {
    // TODO: 학기 추가 API 호출 or 상태 업데이트
    console.log(`Add semester: ${selectedYear}-${selectedTerm}`);
    closeModal();
  };

  return (
    <div className="p-8">
      {/* 헤더: 날짜 및 추가 버튼 */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{headerText}</h1>
        <button
          onClick={openModal}
          className="rounded-full p-2 transition hover:bg-gray-200"
          aria-label="학기 추가"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* 학기 카드 그리드 */}
      <div className="grid grid-cols-4 gap-6">
        {semesters.map((s) => (
          <SemesterCard
            key={s.id}
            display={s.display}
            classCount={s.classCount}
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
            <div className="bg-opacity-30 fixed inset-0 bg-black" />
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
                    <button className="w-full rounded border border-gray-300 p-2">
                      {`${selectedYear}-${selectedTerm}`}
                    </button>
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
