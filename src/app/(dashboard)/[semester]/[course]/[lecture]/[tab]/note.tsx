'use client';

import { components } from '@/types/openapi.schema';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import clsx from 'clsx';
import { MessageSquare } from 'lucide-react';

export default function NoteComponent({
  lecture,
}: {
  lecture: components['schemas']['LectureResponse'];
}) {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
      <div className="mt-4 flex h-[85dvh] gap-x-3">
        <div className="relative max-h-[85dvh] basis-2/3">
          <Viewer
            fileUrl={lecture.materialUrl!}
            plugins={[defaultLayoutPluginInstance]}
          />
          {/* 질문하기 버튼 */}
          <button
            className={clsx(
              'absolute bottom-6 left-3 mx-1 flex items-center gap-x-2 rounded-md border border-[#5971E7] bg-[#5971E7] px-5 py-2 font-medium text-white first:mr-1 first:ml-0 last:mr-0 last:ml-1',
            )}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            질문하기
          </button>
        </div>

        {/* 강의 요약본 */}
        {lecture.summaryStatus !== 'completed' ? (
          <div className="relative flex h-full max-h-[85dvh] basis-1/3 rounded-lg border bg-white p-4 shadow-md">
            <div className="absolute top-1/2 left-1/2 z-[1] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
              <svg
                className="ml-2 h-24 w-24 animate-spin text-[#5971E7]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 100-16 8 8 0 000 16z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6l4 2"
                />
              </svg>
              <br />
              <div className="text-lg font-semibold whitespace-nowrap text-gray-700">
                올려주신 강의 자료를 요약하고 있어요!
              </div>
              <br />

              <div className="text-sm font-semibold text-gray-700">
                완료되면 메일로 알려드릴게요.
              </div>
            </div>

            <div className="h-full w-full space-y-2 overflow-hidden">
              <div className="h-4 w-4/5 animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4 w-2/5 animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4 w-full animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4 w-3/5 animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4 w-4/5 animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4 w-full animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4 w-3/5 animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4 w-3/5 animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4 w-4/5 animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4" />
              <div className="h-4" />
              <div className="h-4 w-4/5 animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4 w-4/5 animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4 w-full animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4 w-3/5 animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4 w-3/5 animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4" />
              <div className="h-4" />
              <div className="h-4 w-full animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4 w-3/5 animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4 w-2/5 animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4 w-4/5 animate-pulse rounded-full bg-neutral-500/30" />
            </div>
          </div>
        ) : (
          <div className="flex h-full w-1/2 items-center justify-center">
            <div dangerouslySetInnerHTML={{ __html: lecture.summary! }} />
          </div>
        )}
      </div>
    </Worker>
  );
}
