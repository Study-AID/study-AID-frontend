'use client';

import { components } from '@/types/openapi.schema';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { MessageSquare } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

type PageRange = { start_page: number; end_page: number };

type Topic = {
  title: string;
  page_range: PageRange;
  description: string;
  additional_details?: string[];
  sub_topics?: Topic[];
};

interface LectureSummaryProps {
  summary: {
    topics: Topic[];
    overview: string;
  };
}

export default function NoteComponent({
  lecture,
}: {
  lecture: components['schemas']['LectureResponse'];
}) {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const utils = useQueryClient();

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  useEffect(() => {
    // if the lecture summary status is not completed, invalidate 10 seconds
    const invalidate = setInterval(() => {
      if (lecture.summaryStatus !== 'completed') {
      utils.invalidateQueries({ queryKey: ['/v1/lectures/{id}'] });
    }
  }, 10000);

    return () => clearInterval(invalidate);
  }, [lecture.summaryStatus]);

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
      <div className="mt-4 flex h-[85dvh] gap-x-3">
        <div className="relative max-h-[85dvh] basis-2/3">

      <Document file={lecture.materialUrl} onLoadSuccess={onDocumentLoadSuccess}>
        <Page pageNumber={pageNumber} />
      </Document>

          {/* <Viewer
            fileUrl={lecture.materialUrl!}
            plugins={[defaultLayoutPluginInstance]}
          /> */}
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
          <SummaryPending />
        ) : (
          <div className="flex h-full w-1/2 flex-col items-center justify-center overflow-y-scroll">
            <LectureSummaryView
              summary={lecture.summary!}
              lectureId={lecture.id}
            />
          </div>
        )}
      </div>
    </Worker>
  );
}

export function SummaryPending() {
  return (
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
  )
}

export function LectureSummaryView({
  summary,
  lectureId,
}: {
  summary: components["schemas"]["Summary"];
  lectureId: string;
}) {

  return (
    <div className="mx-auto w-full h-full max-w-4xl space-y-12 px-4 py-8">
      <section>
        <h2 className="mb-2 text-2xl font-bold">📘 강의 개요</h2>
        <p className="whitespace-pre-wrap text-gray-700">{summary.overview}</p>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">📚 주요 주제</h2>
        <ul className="space-y-8">
          {summary.topics!.map((topic, idx) => (
            <TopicBlock key={idx} topic={topic} level={0} />
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">🔑 핵심 키워드</h2>
        <ul className="space-y-2">
          {summary.keywords!.map((kw, idx) => (
            <li key={idx} className="rounded border bg-gray-50 p-4">
              <h3 className="font-semibold">{kw.keyword}</h3>
              {kw.pageRange && <p className="text-sm text-gray-600">
                📄 p.{kw.pageRange.startPage}~{kw.pageRange.endPage} |
                관련도: {kw.relevance}
              </p>}
              <p className="mt-1">{kw.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-2xl font-bold">📖 참고 자료</h2>
        {summary.additionalReferences && <ul className="list-inside list-disc">
          {summary.additionalReferences.map((ref, i) => (
            <li key={i}>{ref}</li>
          ))}
        </ul>}
      </section>
    </div>
  );
}

function TopicBlock({ topic, level }: { topic: components["schemas"]["TopicDetails"]; level: number }) {
  return (
    <li className="border-l-4 border-blue-400 pl-4">
      <h3
        className={`mb-1 text-xl font-semibold ${level > 0 ? 'text-blue-600' : ''}`}
      >
        {topic.title}
      </h3>
      {topic.pageRange && <p className="mb-1 text-sm text-gray-600">
        📄 p.{topic.pageRange.startPage}~{topic.pageRange.endPage}
      </p>}
      <p className="mb-2 whitespace-pre-wrap">{topic.description}</p>
      {topic.additionalDetails?.map((detail, idx) => (
        <p key={idx} className="mb-1 text-sm text-gray-700">
          • {detail}
        </p>
      ))}

      {topic.subTopics && (
        <ul className="mt-4 ml-4 space-y-4">
          {topic.subTopics.map((sub, i) => (
            <TopicBlock key={i} topic={sub} level={level + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}
