'use client';

import { api } from '@/api/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { Resolver, useForm } from 'react-hook-form';
import { QuizCreateFormValues, quizCreateSchema } from './quizSchema';

export default function QuizCreatePage() {
  const params = useParams();

  const lectureId = params.lecture as string;

  return <QuizCreateComponent lectureId={lectureId} />;
}

function QuizCreateComponent({ lectureId }: { lectureId: string }) {
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
        queryKey: [
          'get',
          '/v1/quizzes/lecture/{lectureId}',
          {
            params: {
              path: {
                lectureId: lectureId,
              },
            },
          },
        ],
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
