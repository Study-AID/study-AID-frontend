'use client';

import { api } from '@/api/client';
import { AddQuizCard, QuizCard } from '@/component/QuizCard';
import { components } from '@/types/openapi.schema';
import { keepPreviousData } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';

export default function QuizListPage() {
  const params = useParams();

  const semesterId = params.semester as string;
  const courseId = params.course as string;
  const lectureId = params.lecture as string;

  return (
    <QuizComponent
      semesterId={semesterId}
      courseId={courseId}
      lectureId={lectureId}
    />
  );
}

function QuizComponent({
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
      refetchInterval: 1000 * 5,
      placeholderData: keepPreviousData,
      meta: {
        isBackgroundTask: true,
      },
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
    <div className="mt-4 flex gap-3 overflow-x-auto border border-[#B8B8B8] bg-[#F7F7F7] p-6">
      {data.quizzes?.map((quiz: components['schemas']['QuizResponse']) => (
        <QuizCard
          key={quiz.id}
          quiz={quiz}
          semesterId={semesterId}
          courseId={courseId}
          lectureId={lectureId}
        />
      ))}
      <AddQuizCard
        onClick={() => {
          router.push(`/${semesterId}/${courseId}/${lectureId}/quiz/create`);
        }}
      />
    </div>
  );
}
