'use client';

import { api } from '@/api/client';
import { TabPanel } from '@headlessui/react';
import { useParams, useSearchParams } from 'next/navigation';
import NoteComponent from './note';
import QnAHistoryComponent from './qnaHistory';
import { QuizComponent, QuizCreateComponent, QuizSolveComponent } from './quiz';

export default function LecturePage() {
  const params = useParams();
  const semesterId = params.semester as string;
  const courseId = params.course as string;
  const lectureId = params.lecture as string;
  const tab = params.tab as string;

  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const create = searchParams.get('create');
  const p = searchParams.get('p');

  const { data, isLoading, error } = api.useQuery('get', '/v1/lectures/{id}', {
    params: {
      path: {
        id: lectureId,
      },
    },
  });

  if (isLoading || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-lg font-semibold text-gray-700">Loading...</span>
      </div>
    );
  }

  if (tab === 'note') {
    return <NoteComponent lecture={data} />;
  }

  if (tab === 'quiz') {
    if (create) {
      return <QuizCreateComponent lectureId={lectureId} />;
    } else if (id) {
      return <QuizSolveComponent quizId={id} problem={Number(p!)} />;
    }

    return (
      <QuizComponent
        semesterId={semesterId}
        courseId={courseId}
        lectureId={lectureId}
      />
    );
  }

  return <QnAHistoryComponent />;
}
