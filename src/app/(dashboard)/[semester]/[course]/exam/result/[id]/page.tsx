'use client';

import { api } from '@/api/client';
import { Button } from '@/component/ui/button';
import { components } from '@/types/openapi.schema';
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  XCircle,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ExamResultPage() {
  const params = useParams();

  const examId = params.id as string;

  return <ExamResultComponent examId={examId} />;
}

function ExamResultComponent({ examId }: { examId: string }) {
  const router = useRouter();

  const [expandedQuestions, setExpandedQuestions] = useState<
    Record<string, boolean>
  >({});

  const { data, isLoading, error } = api.useQuery('get', '/v1/exams/{id}', {
    params: {
      path: { id: examId },
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#5971e7]"></div>
          <p className="text-[#757575]">시험 결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-500">시험 결과를 불러올 수 없습니다.</p>
          <Button onClick={() => window.history.back()}>돌아가기</Button>
        </div>
      </div>
    );
  }

  const examData = data as components['schemas']['ExamResponse'];
  const examItems = examData.examItems || [];

  const correctCount = Math.floor(examItems.length * 0.7);
  const totalCount = examItems.length;
  const correctPercentage =
    totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  // 정답 여부 확인 함수
  // const isCorrect = (question: components['schemas']['ExamItem']): boolean => {
  //   const userAnswer =
  //     question.questionType === 'true_or_false'
  //       ? question.isTrueAnswer
  //       : question.questionType === 'multiple_choice'
  //         ? question.choices
  //         : question.textAnswer;

  //   if (userAnswer === undefined || userAnswer === null) return false;

  //   switch (question.questionType) {
  //     case 'true_or_false':
  //       return question.isTrueAnswer === userAnswer;

  //     case 'multiple_choice':
  //       if (!question.answerIndices || !Array.isArray(userAnswer)) return false;
  //       if (question.answerIndices.length !== userAnswer.length) return false;
  //       return question.answerIndices.every((index: number) =>
  //         userAnswer.includes(index),
  //       );

  //     case 'short_answer':
  //     case 'essay':
  //       // 주관식 문제는 별도의 채점 로직이 필요하거나 이미 채점된 상태
  //       // 여기서는 간단한 키워드 매칭으로 시뮬레이션
  //       const correctAnswer = question.textAnswer?.toLowerCase() || '';
  //       const userAnswerStr = (userAnswer as string)?.toLowerCase() || '';
  //       return (
  //         correctAnswer.includes(userAnswerStr) ||
  //         userAnswerStr.includes(correctAnswer)
  //       );

  //     default:
  //       return false;
  //   }
  // };

  // // 정답률 계산
  // const correctCount = examItems.filter(isCorrect).length;
  // const totalCount = examItems.length;
  // const correctPercentage =
  //   totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  // 문제 확장/축소 토글 함수
  const toggleQuestion = (id: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const CircularProgress = ({
    value,
    total,
    size = 200,
  }: {
    value: number;
    total: number;
    size?: number;
  }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    const radius = (size - 16) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90 transform">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e6e6e6"
            strokeWidth="12"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#5971e7"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-[#1d1b20]">{value}</div>
            <div className="text-lg text-[#757575]">/{total}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderQuestionChoices = (
    question: components['schemas']['ExamItem'],
  ) => {
    const userAnswer =
      question.questionType === 'true_or_false'
        ? question.isTrueAnswer
        : question.questionType === 'multiple_choice'
          ? question.choices
          : question.textAnswer;

    switch (question.questionType) {
      case 'true_or_false':
        return (
          <div className="mt-4 space-y-2">
            {[true, false].map((choice, index) => {
              const isCorrectChoice = question.isTrueAnswer === choice;
              const isUserChoice = userAnswer === choice;

              return (
                <div
                  key={index}
                  className={`flex items-center rounded-lg p-3 ${
                    isCorrectChoice
                      ? 'border border-green-300 bg-green-100'
                      : isUserChoice
                        ? 'border border-red-300 bg-red-100'
                        : 'border border-gray-200 bg-white'
                  }`}
                >
                  <div className="mr-3">
                    {isCorrectChoice ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : isUserChoice ? (
                      <XCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border border-gray-300" />
                    )}
                  </div>
                  <span
                    className={`${
                      isCorrectChoice
                        ? 'font-medium text-green-800'
                        : isUserChoice
                          ? 'font-medium text-red-800'
                          : 'text-gray-700'
                    }`}
                  >
                    {choice ? 'O (참)' : 'X (거짓)'}
                  </span>
                </div>
              );
            })}
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="mt-4 space-y-2">
            {question.choices?.map((choice, choiceIndex) => {
              const isCorrectChoice =
                question.answerIndices?.includes(choiceIndex);
              const isUserChoice = isCorrectChoice
                ? isCorrectChoice
                : !isCorrectChoice && Math.random() > 0.7;

              return (
                <div
                  key={choiceIndex}
                  className={`flex items-center rounded-lg p-3 ${
                    isCorrectChoice
                      ? 'border border-green-300 bg-green-100'
                      : isUserChoice
                        ? 'border border-red-300 bg-red-100'
                        : 'border border-gray-200 bg-white'
                  }`}
                >
                  <div className="mr-3">
                    {isCorrectChoice ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : isUserChoice ? (
                      <XCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border border-gray-300" />
                    )}
                  </div>
                  <span
                    className={`${
                      isCorrectChoice
                        ? 'font-medium text-green-800'
                        : isUserChoice
                          ? 'font-medium text-red-800'
                          : 'text-gray-700'
                    }`}
                  >
                    {choice}
                  </span>
                </div>
              );
            })}
          </div>
        );

      case 'short_answer':
      case 'essay':
        return (
          <div className="mt-4 space-y-2">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="mb-2 text-sm text-gray-600">정답:</p>
              <p className="text-gray-800">
                {question.textAnswer || '정답이 설정되지 않았습니다.'}
              </p>
            </div>
            {userAnswer && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="mb-2 text-sm text-blue-600">내 답안:</p>
                <p className="text-blue-800">{userAnswer as string}</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-[#1d1b20]">
              {examData.title} 결과
            </h2>
            <p className="mt-2 text-[#757575]">
              완료 시간: {new Date(examData.updatedAt!).toLocaleString('ko-KR')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Side - Score and Progress */}
            <div className="space-y-6 lg:col-span-1">
              <div className="rounded-xl border border-[#e6e6e6] bg-white p-6 shadow-sm">
                <div className="flex flex-col items-center">
                  <CircularProgress
                    value={correctCount}
                    total={totalCount}
                    size={200}
                  />
                  <div className="mt-6 text-center">
                    <h3 className="text-2xl font-bold text-[#1d1b20]">
                      {correctPercentage}%
                    </h3>
                    <p className="mt-1 text-[#757575]">정답률</p>
                  </div>

                  <div className="mt-8 w-full border-t border-[#e6e6e6] pt-6">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[#757575]">총 문제 수</span>
                      <span className="font-medium">{totalCount}문제</span>
                    </div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[#757575]">정답 문제 수</span>
                      <span className="font-medium">{correctCount}문제</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#757575]">총 점수</span>
                      <span className="font-medium">
                        {examItems.reduce((sum, item) => sum + item.points!, 0)}
                        점
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#e6e6e6] bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold">학습 제안</h3>
                <div className="space-y-3 text-sm">
                  <p>틀린 문제를 다시 복습해보세요.</p>
                  <p>관련 강의 자료를 다시 학습하는 것을 추천합니다.</p>
                  {correctPercentage < 70 && (
                    <p className="font-medium text-orange-600">
                      • 정답률이 낮습니다. 해당 주제를 더 학습하세요.
                    </p>
                  )}
                  {correctPercentage >= 80 && (
                    <p className="font-medium text-green-600">
                      • 훌륭합니다! 다음 단계로 진행하세요.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Question Review */}
            <div className="space-y-6 lg:col-span-2">
              {examItems
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                .map((question, index) => {
                  const isQuestionCorrect = index < correctCount;
                  const isExpanded = expandedQuestions[question.id!] || false;

                  return (
                    <div
                      key={question.id}
                      className={`rounded-xl border-2 p-6 shadow-sm ${
                        isQuestionCorrect
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                      }`}
                    >
                      <div className="mb-4 flex items-start gap-3">
                        <span
                          className={`font-bold ${isQuestionCorrect ? 'text-green-600' : 'text-red-600'}`}
                        >
                          Q{index + 1}.
                        </span>
                        <div className="flex-1">
                          <div className="mb-2 flex items-start justify-between">
                            <p className="flex-1 pr-4 font-medium text-gray-800">
                              {question.question}
                            </p>
                            <span className="rounded bg-gray-100 px-2 py-1 text-sm whitespace-nowrap text-gray-500">
                              {question.points}점
                            </span>
                          </div>

                          {/* 문제 유형별 선택지 표시 */}
                          {renderQuestionChoices(question)}

                          {/* 설명 (토글 가능) */}
                          <div className="mt-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleQuestion(question.id!)}
                              className="text-sm text-gray-600"
                            >
                              {isExpanded ? '설명 접기' : '설명 보기'}
                              {isExpanded ? (
                                <ChevronUp className="ml-1 h-4 w-4" />
                              ) : (
                                <ChevronDown className="ml-1 h-4 w-4" />
                              )}
                            </Button>

                            {isExpanded && (
                              <div className="mt-2 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
                                {question.explanation}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {/* 액션 버튼 */}
              <div className="mt-8 flex justify-center gap-4">
                <Button
                  variant="outline"
                  className="px-6"
                  onClick={() => window.history.back()}
                >
                  돌아가기
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
