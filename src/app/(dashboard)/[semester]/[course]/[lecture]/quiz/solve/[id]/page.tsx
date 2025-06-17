'use client';

import { api } from '@/api/client';
import { components } from '@/types/openapi.schema';
import { useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function QuizSolvePage() {
  const params = useParams();

  const quizId = params.id as string;
  const lectureId = params.lecture as string;

  return <QuizSolveComponent quizId={quizId} lectureId={lectureId} />;
}

export function QuizSolveComponent({
  quizId,
  lectureId,
}: {
  quizId: string;
  lectureId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialIndex = Number(searchParams.get('p') ?? '1');

  const [problemIndex, setProblemIndex] = useState<number>(initialIndex);
  const utils = useQueryClient();

  useEffect(() => {
    const p = parseInt(searchParams.get('p') ?? '1', 10);
    if (p !== problemIndex) setProblemIndex(p);
  }, [searchParams, problemIndex]);

  const [answers, setAnswers] = useState<
    Record<number, components['schemas']['SubmitQuizItem']>
  >({});

  const { data, isLoading, error } = api.useQuery('get', '/v1/quizzes/{id}', {
    params: {
      path: { id: quizId },
    },
  });

  // Submit all answers
  const mutation = api.useMutation('post', '/v1/quizzes/{id}/submit');
  const handleSubmit = () => {
    mutation.mutate(
      {
        params: {
          path: {
            id: quizId,
          },
        },
        body: {
          submitQuizItems: Object.entries(answers).map(([key, value]) => value),
        },
      },
      {
        onSuccess: () => {
          utils.invalidateQueries({
            queryKey: [
              'get',
              '/v1/quizzes/lecture/{lectureId}',
              {
                params: {
                  path: {
                    lectureId: data?.lectureId,
                  },
                },
              },
            ],
          });

          utils.setQueryData(
            [
              'get',
              '/v1/quizzes/lecture/{lectureId}',
              { params: { path: { lectureId: lectureId } } },
            ],
            (oldData: components['schemas']['QuizListResponse']) => {
              if (!oldData || !oldData.quizzes) return oldData;
              return {
                quizzes: [
                  ...oldData.quizzes!.filter((quiz) => quiz.id !== quizId),
                  {
                    ...data,
                    status: 'submitted',
                  },
                ],
              };
            },
          );

          utils.invalidateQueries({
            queryKey: [
              'get',
              '/v1/quizzes/{id}',
              {
                params: {
                  path: {
                    id: quizId,
                  },
                },
              },
            ],
          });
        },
        onError: (error) => {
          console.error('Quiz submission error:', error);
        },
      },
    );
    router.back();
  };

  const question = data?.quizItems?.[problemIndex - 1];

  const handleAnswer = useCallback(
    (value: string | number) => {
      if (!question) return;
      const base: components['schemas']['SubmitQuizItem'] = {
        quizItemId: question.id,
        questionType: question.questionType,
      };
      const item: components['schemas']['SubmitQuizItem'] = { ...base };

      switch (question.questionType) {
        case 'true_or_false':
          item.selectedBool = value === 'O';
          break;
        case 'multiple_choice':
          const idx = question.choices!.indexOf(value as string);
          item.selectedIndices = [idx];
          break;
        case 'short_answer':
        case 'essay':
          item.textAnswer = value as string;
          break;
        default:
          break;
      }

      setAnswers((prev) => ({ ...prev, [problemIndex]: item }));
    },
    [problemIndex, question],
  );

  if (isLoading || !data || !data.quizItems || !question) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-lg font-semibold text-gray-700">Loading...</span>
      </div>
    );
  }

  const go = (n: number) => {
    const next = problemIndex + n;
    if (next < 1) router.back();
    if (next > data.quizItems!.length) return;
    router.replace(`?p=${next}`);
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      <div className="w-full">
        {/* Quiz Header */}
        <div className="mb-8 text-center">
          {/* <div className="flex justify-between items-center mb-4">
                <div></div>
                <span className="text-lg font-medium text-[#757575]">남은 시간: 04:12</span>
              </div> */}
        </div>

        {/* Question & Options */}
        <div className="mb-8 rounded-lg border border-[#e6e6e6] bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-start gap-3">
            <Star className="mt-1 h-5 w-5 text-[#ffa500]" />
            <p className="text-lg leading-relaxed text-[#1d1b20]">
              {problemIndex}. {question.question}
            </p>
          </div>

          {/* OX */}
          {question.questionType === 'true_or_false' && (
            <div className="flex justify-center space-x-8">
              {['O', 'X'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  className={`h-24 w-24 rounded border-2 text-4xl font-bold ${
                    answers[problemIndex]?.selectedBool === (opt === 'O')
                      ? 'border-blue-500 bg-blue-300 text-white'
                      : 'border-blue-500 text-blue-500'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* 선택형 */}
          {question.questionType === 'multiple_choice' && (
            <div className="grid grid-cols-2 gap-6">
              {question.choices!.map((opt, idx) => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  className={`rounded border-2 p-4 text-lg font-medium ${
                    answers[problemIndex]?.selectedIndices?.[0] === idx
                      ? 'border-blue-500 bg-blue-300 text-white'
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* 단답/서술 */}
          {(question.questionType === 'short_answer' ||
            question.questionType === 'essay') && (
            <div className="w-full max-w-lg">
              {question.questionType === 'short_answer' ? (
                <input
                  type="text"
                  value={answers[problemIndex]?.textAnswer ?? ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  className="w-full rounded border border-gray-300 p-2"
                  placeholder="답을 입력해주세요"
                />
              ) : (
                <textarea
                  rows={4}
                  value={answers[problemIndex]?.textAnswer ?? ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  className="w-full rounded border border-gray-300 p-2"
                  placeholder="답을 입력해주세요"
                />
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-center space-x-6 p-4">
          <button
            onClick={() => go(-1)}
            className="cursor-pointer rounded bg-blue-200 px-6 py-2 text-blue-700 disabled:opacity-50"
          >
            이전
          </button>
          {problemIndex < data.quizItems.length ? (
            <button
              onClick={() => go(1)}
              className="cursor-pointer rounded bg-blue-500 px-6 py-2 text-white"
            >
              다음
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="cursor-pointer rounded bg-green-600 px-6 py-2 text-white"
            >
              제출하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
