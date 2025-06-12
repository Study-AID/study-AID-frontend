'use client';

import { components } from '@/types/openapi.schema';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Edit2,
  FileText,
  Loader2,
  Plus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export function QuizCard({
  semesterId,
  courseId,
  lectureId,
  quiz,
}: {
  semesterId: string;
  courseId: string;
  lectureId: string;
  quiz: components['schemas']['QuizResponse'];
}) {
  const router = useRouter();

  const getStatusConfig = (
    status:
      | 'generate_in_progress'
      | 'not_started'
      | 'submitted'
      | 'partially_graded'
      | 'graded',
  ) => {
    switch (status) {
      case 'generate_in_progress':
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-700',
          icon: <Loader2 className="h-6 w-6 animate-spin" />,
          statusText: '생성 중...',
          statusBg: 'bg-blue-100',
          statusTextColor: 'text-blue-800',
          disabled: true,
        };
      case 'not_started':
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-700',
          icon: <FileText className="h-6 w-6" />,
          statusText: '시작 전',
          statusBg: 'bg-gray-100',
          statusTextColor: 'text-gray-700',
          disabled: false,
        };
      case 'submitted':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-700',
          icon: <Clock className="h-6 w-6" />,
          statusText: '채점 대기',
          statusBg: 'bg-yellow-100',
          statusTextColor: 'text-yellow-800',
          disabled: true,
        };
      case 'partially_graded':
        return {
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-700',
          icon: <AlertCircle className="h-6 w-6" />,
          statusText: '부분 채점',
          statusBg: 'bg-orange-100',
          statusTextColor: 'text-orange-800',
          disabled: false,
        };
      case 'graded':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700',
          icon: <CheckCircle className="h-6 w-6" />,
          statusText: '채점 완료',
          statusBg: 'bg-green-100',
          statusTextColor: 'text-green-800',
          disabled: false,
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-700',
          icon: <FileText className="h-6 w-6" />,
          statusText: '알 수 없음',
          statusBg: 'bg-gray-100',
          statusTextColor: 'text-gray-700',
          disabled: true,
        };
    }
  };

  const statusConfig = getStatusConfig(quiz.status);

  const handleClick = () => {
    if (statusConfig.disabled) return;

    // 상태에 따라 다른 페이지로 이동
    if (quiz.status === 'graded' || quiz.status === 'partially_graded') {
      router.push(
        `/${semesterId}/${courseId}/${lectureId}/quiz/result/${quiz.id}`,
      );
    } else {
      router.push(
        `/${semesterId}/${courseId}/${lectureId}/quiz/solve/${quiz.id}`,
      );
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative flex h-56 w-44 flex-col overflow-hidden rounded-lg border shadow-md transition ${
        statusConfig.disabled
          ? 'cursor-not-allowed opacity-75'
          : 'cursor-pointer hover:shadow-xl'
      } ${statusConfig.bgColor} ${statusConfig.borderColor}`}
    >
      {/* 상태 표시 배지 */}
      <div
        className={`absolute top-2 right-2 rounded-full px-2 py-1 text-xs font-medium ${statusConfig.statusBg} ${statusConfig.statusTextColor}`}
      >
        {statusConfig.statusText}
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <div className={`mb-3 ${statusConfig.textColor}`}>
          {statusConfig.icon}
        </div>
        <span
          className={`text-center text-lg font-semibold ${statusConfig.textColor}`}
        >
          {quiz.title}
        </span>

        {/* 추가 정보 표시 */}
        {/* {quiz.status === 'graded' && quiz.score !== undefined && (
          <div className="mt-2 text-center">
            <span className="text-sm font-medium text-green-600">
              점수: {quiz.score}점
            </span>
          </div>
        )} */}

        {quiz.status === 'generate_in_progress' && (
          <div className="mt-2 text-center">
            <span className="text-xs text-blue-600">
              문제를 생성하고 있습니다
            </span>
          </div>
        )}
      </div>

      {/* 하단 액션 영역 */}
      <div
        className={`flex h-12 items-center justify-center text-sm font-medium ${statusConfig.statusBg} ${statusConfig.statusTextColor}`}
      >
        {quiz.status === 'not_started' && '퀴즈 시작하기'}
        {quiz.status === 'generate_in_progress' && '생성 중...'}
        {quiz.status === 'submitted' && '결과 대기 중'}
        {quiz.status === 'partially_graded' && '결과 확인하기'}
        {quiz.status === 'graded' && '결과 보기'}
      </div>
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
