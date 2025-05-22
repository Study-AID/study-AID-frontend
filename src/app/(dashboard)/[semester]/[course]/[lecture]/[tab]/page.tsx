'use client';

import { api } from '@/api/client';
import { TabPanel } from '@headlessui/react';
import { useParams } from 'next/navigation';
import NoteComponent from './note';
import QnAHistoryComponent from './qnaHistory';

export default function LecturePage() {
  const params = useParams();
  const lectureId = params.lecture as string;
  const tab = params.tab as string;

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
    return (
      <div>
        <div className="flex h-full items-center justify-center">
          <span className="text-lg font-semibold text-gray-700">
            강의 퀴즈는 준비중입니다.
          </span>
        </div>
      </div>
    );
  }

  return <QnAHistoryComponent />;
}
