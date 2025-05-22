'use client';

import { api } from '@/api/client';
import { AddQuizCard, QuizCard } from '@/component/QuizCard';
import { components } from '@/types/openapi.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Resolver, useForm } from 'react-hook-form';
import { QuizCreateFormValues, quizCreateSchema } from './quizSchema';

export function QuizComponent({
  semesterId,
  courseId,
  lectureId,
}: {
  lectureId: string;
  semesterId: string;
  courseId: string;
}) {
  const router = useRouter();
  const { data, isLoading, error } = api.useQuery(
    'get',
    '/v1/quizzes/lecture/{lectureId}',
    {
      params: {
        path: {
          lectureId: lectureId,
        },
      },
    },
    {
      refetchInterval: 1000 * 10,
    },
  );

  if (isLoading || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-lg font-semibold text-gray-700">Loading...</span>
      </div>
    );
  }

  return (
    <div className="mt-4 grid grid-cols-6 gap-3 border border-[#B8B8B8] bg-[#F7F7F7] p-6">
      {data.quizzes?.map((quiz: components['schemas']['Quiz']) => (
        <QuizCard
          key={quiz.id}
          quiz={quiz}
          onClick={() => {
            router.push(
              `/${semesterId}/${courseId}/${lectureId}/quiz?id=${quiz.id}&p=1`,
            );
          }}
        />
      ))}
      <AddQuizCard
        onClick={() => {
          router.push(
            `/${semesterId}/${courseId}/${lectureId}/quiz?create=true`,
          );
        }}
      />
    </div>
  );
}

export function QuizCreateComponent({ lectureId }: { lectureId: string }) {
  const router = useRouter();
  const utils = useQueryClient();

  const quizItems = [
    {
      id: 'trueOrFalseCount',
      title: 'O/X 문제',
      preview: (
        <div className="flex items-center justify-center space-x-4">
          <button className="h-16 w-16 rounded bg-indigo-500 font-bold text-white">
            O
          </button>
          <button className="h-16 w-16 rounded border border-gray-300 font-bold text-gray-700">
            X
          </button>
        </div>
      ),
    },
    {
      id: 'multipleChoiceCount',
      title: '선택형 문제',
      preview: (
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded border border-gray-300 px-2 py-4 text-center">
            Option1
          </div>
          <div className="rounded bg-indigo-500 px-2 py-4 text-center text-white">
            Option2
          </div>
          <div className="rounded border border-gray-300 px-2 py-4 text-center">
            Option3
          </div>
          <div className="rounded border border-gray-300 px-2 py-4 text-center">
            Option4
          </div>
        </div>
      ),
    },
    {
      id: 'shortAnswerCount',
      title: '단답형 문제',
      preview: (
        <div>
          <p className="font-medium">Question 1. blah bl</p>
          <input
            type="text"
            placeholder="my answer is .."
            className="mt-2 w-full rounded border border-gray-300 px-2 py-1"
          />
        </div>
      ),
    },
    {
      id: 'essayCount',
      title: '서술형 문제',
      preview: (
        <div>
          <p className="font-medium">Question 1. blah bl</p>
          <div className="mt-2 space-y-1 rounded border border-gray-300 p-2">
            <p>my answer is ..</p>
            <p>my answer is ..</p>
          </div>
        </div>
      ),
    },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuizCreateFormValues>({
    resolver: zodResolver(quizCreateSchema) as Resolver<QuizCreateFormValues>,
    defaultValues: {
      title: '',
      lectureId: lectureId,
      shortAnswerCount: 0,
      multipleChoiceCount: 0,
      trueOrFalseCount: 0,
      essayCount: 0,
    },
  });

  const quizCreateMutation = api.useMutation('post', '/v1/quizzes', {
    onSuccess: (response: any) => {
      utils.invalidateQueries({
        queryKey: ['/v1/quizzes/lecture/{lectureId}'],
      });
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });

  const onSubmit = (data: QuizCreateFormValues) => {
    quizCreateMutation.mutate({
      body: data,
    });
    router.back();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-4xl p-6">
      <div className="mb-6 rounded bg-gray-200 py-4 text-center">
        <h2 className="text-lg font-semibold">퀴즈 생성</h2>
      </div>
      {/* Quiz Title Input */}
      <div className="mb-4">
        <label className="mb-1 block font-medium">퀴즈 제목</label>
        <input
          {...register('title')}
          className="w-full rounded border border-gray-300 px-3 py-2"
          placeholder="퀴즈 제목을 입력하세요"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* Quiz Cards */}
      <div className="mb-6 grid grid-cols-4 gap-6">
        {quizItems.map((item) => (
          <div
            key={item.id}
            className="flex h-60 flex-col rounded border border-indigo-500 shadow-sm"
          >
            <div className="rounded-t bg-indigo-500 py-3 text-center text-white">
              {item.title}
            </div>
            <div className="flex flex-1 items-center justify-center p-4">
              {item.preview}
            </div>
          </div>
        ))}
      </div>

      {/* Input Fields Below Cards */}
      <div className="mb-6 grid grid-cols-4 gap-6">
        {quizItems.map((item) => (
          <div key={item.id} className="p-4">
            <input
              type="number"
              {...register(item.id as keyof QuizCreateFormValues, {
                valueAsNumber: true,
                min: 0,
              })}
              className="w-full rounded border border-gray-300 py-2 text-center text-lg font-semibold"
            />
            {errors[item.id as keyof QuizCreateFormValues] && (
              <p className="mt-1 text-xs text-red-500">
                {errors[item.id as keyof QuizCreateFormValues]?.message}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded bg-red-500 px-6 py-2 text-white hover:bg-red-600"
        >
          취소하기
        </button>
        <button
          type="submit"
          className="rounded bg-green-600 px-6 py-2 text-white hover:bg-green-700"
        >
          생성하기
        </button>
      </div>
    </form>
  );
}

export function QuizSolveComponent({
  quizId,
  problem,
}: {
  quizId: string;
  problem: number;
}) {
  const router = useRouter();
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
    mutation.mutate({
      params: {
        path: {
          id: quizId,
        },
      },
      body: {
        submitQuizItems: Object.entries(answers).map(([key, value]) => value),
      },
    });
  };

  if (isLoading || !data || !data.quizItems) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-lg font-semibold text-gray-700">Loading...</span>
      </div>
    );
  }

  const question = data.quizItems[problem - 1];

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

      setAnswers((prev) => ({ ...prev, [problem]: item }));
    },
    [problem, question],
  );

  const go = (n: number) => {
    const next = problem + n;
    if (next < 1 || next > data.quizItems!.length) return;
    router.replace(`?p=${next}`);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-200 px-4 py-2">
        <h2 className="font-semibold">{data.title}</h2>
        <span>
          문제: {problem}/{data.quizItems.length}
        </span>
      </div>

      {/* Question & Options */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="mb-6 text-center text-gray-700">
          {problem}. {question.question}
        </div>

        {/* OX */}
        {question.questionType === 'true_or_false' && (
          <div className="flex space-x-8">
            {['O', 'X'].map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                className={`h-24 w-24 rounded border-2 text-4xl font-bold ${
                  answers[problem]?.selectedBool === (opt === 'O')
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
                  answers[problem]?.selectedIndices?.[0] === idx
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
                value={answers[problem]?.textAnswer ?? ''}
                onChange={(e) => handleAnswer(e.target.value)}
                className="w-full rounded border border-gray-300 p-2"
                placeholder="답을 입력해주세요"
              />
            ) : (
              <textarea
                rows={4}
                value={answers[problem]?.textAnswer ?? ''}
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
          disabled={problem === 1}
          className="rounded bg-blue-200 px-6 py-2 text-blue-700 disabled:opacity-50"
        >
          이전
        </button>
        {problem < data.quizItems.length ? (
          <button
            onClick={() => go(1)}
            className="rounded bg-blue-500 px-6 py-2 text-white"
          >
            다음
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="rounded bg-green-600 px-6 py-2 text-white"
          >
            제출하기
          </button>
        )}
      </div>
    </div>
  );
}
