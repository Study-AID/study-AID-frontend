'use client';

import { components } from '@/types/openapi.schema';
import { useQueryClient } from '@tanstack/react-query';
import { useIntersectionObserver } from '@wojtekmaj/react-hooks';
import clsx from 'clsx';
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  Heart,
  MessageCircle,
  MessageSquare,
  Minus,
  Plus,
  Send,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { api } from '@/api/client';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const observerConfig = {
  threshold: 0,
};

interface ChatMessage {
  messageId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
  isLiked: boolean;
}

function ResizeHandle({ onResize }: { onResize: (deltaX: number) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const lastMouseX = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // movementX 대신 직접 계산하여 더 정확한 값 사용
        const deltaX = e.clientX - lastMouseX.current;
        lastMouseX.current = e.clientX;
        onResize(deltaX);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onResize]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMouseX.current = e.clientX;
  };

  return (
    <div
      className={clsx(
        'w-2 cursor-col-resize bg-gray-300 transition-all duration-150 hover:w-3 hover:bg-blue-500',
        isDragging && 'w-3 bg-blue-500',
      )}
      onMouseDown={handleMouseDown}
    />
  );
}

function ChatWidget({
  lectureId,
  isOpen,
  onClose,
  contexts,
  removeContext,
}: {
  lectureId: string;
  isOpen: boolean;
  onClose: () => void;
  contexts?: string[];
  removeContext: (index: number) => void;
}) {
  const {
    data: messagesData,
    isLoading,
    error,
  } = api.useQuery(
    'get',
    '/v1/lectures/{lectureId}/qna-chat/messages',
    {
      params: {
        path: {
          lectureId: lectureId,
        },
      },
    },
    {
      refetchInterval: 5000,
    },
  );
  const questionMutation = api.useMutation(
    'post',
    '/v1/lectures/{lectureId}/qna-chat/messages',
  );

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const messages = useMemo(() => {
    if (isLoading) return [];
    if (error)
      return [
        {
          messageId: 'error',
          role: 'system',
          content: '메시지를 불러오는 중 오류가 발생했습니다.',
          createdAt: new Date(),
          isLiked: false,
        },
      ];
    return messagesData?.messages || [];
  }, [isLoading, error, messagesData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    questionMutation.mutate(
      {
        params: {
          path: {
            lectureId: lectureId,
          },
        },
        body: {
          question: `\`\`\`${contexts}\`\`\` \n ${inputText}`,
        },
      },
      {
        onSuccess: () => {
          setInputText('');
        },
      },
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAddHighlightToInput = (text: string) => {
    const currentText = inputText;
    const newText = currentText ? `${currentText} "${text}"` : `"${text}"`;
    setInputText(newText);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-16 left-4 z-30 flex h-96 w-80 flex-col rounded-lg border border-gray-200 bg-white shadow-2xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between rounded-t-lg bg-[#5971e7] p-3 text-white">
        <h3 className="text-sm font-semibold">QnA Chat</h3>
        <button
          onClick={onClose}
          className="text-white transition-colors hover:text-gray-200"
        >
          <X size={16} />
        </button>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 space-y-3 overflow-y-auto p-3 text-sm">
        {isLoading ? (
          <div className="text-center text-gray-500">
            메시지를 불러오는 중...
          </div>
        ) : error ? (
          <div className="text-center text-red-500">
            메시지를 불러올 수 없습니다.
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.messageId}
              className={clsx(
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start',
              )}
            >
              <div
                className={clsx(
                  'max-w-[85%] rounded-lg p-2 text-xs leading-relaxed whitespace-pre-wrap',
                  message.role === 'user'
                    ? 'bg-[#5971e7] text-white'
                    : 'bg-gray-100 text-gray-800',
                )}
              >
                {message.content}
                {message.content.includes('❤️') && (
                  <Heart
                    className="ml-1 inline h-3 w-3 text-red-500"
                    fill="currentColor"
                  />
                )}
              </div>
            </div>
          ))
        )}
        {questionMutation.isPending && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-gray-100 p-2 text-xs text-gray-800">
              답변을 생성하고 있습니다...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 하이라이트된 텍스트 영역 */}
      {contexts && contexts.length > 0 && (
        <div className="max-h-24 overflow-y-auto border-t bg-gray-50 p-3">
          <div className="mb-2 text-xs text-gray-600">하이라이트된 텍스트:</div>
          <div className="space-y-1">
            {contexts.map((context, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded border bg-white p-2 text-xs"
              >
                <button
                  onClick={() => handleAddHighlightToInput(context)}
                  className="flex-1 truncate rounded px-1 text-left hover:bg-gray-50"
                  title={context}
                >
                  <span className="text-blue-600">
                    "{context.slice(0, 30)}..."
                  </span>
                </button>
                <button
                  onClick={() => removeContext(i)}
                  className="ml-2 text-gray-400 hover:text-red-500"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 입력 영역 */}
      <div className="border-t p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요..."
            className="flex-1 rounded border border-gray-300 p-2 text-xs focus:ring-1 focus:ring-[#5971e7] focus:outline-none"
            disabled={questionMutation.isPending}
          />
          <button
            onClick={handleSendMessage}
            disabled={questionMutation.isPending || !inputText.trim()}
            className="rounded bg-[#5971e7] p-2 text-white transition-colors hover:bg-[#4a5fd1] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NoteComponent({
  lecture,
}: {
  lecture: components['schemas']['LectureResponse'];
}) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [containerWidth, setContainerWidth] = useState(800);
  const [visiblePages, setVisiblePages] = useState({});
  const [selectionText, setSelectionText] = useState('');
  const [toolbarPos, setToolbarPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(60); // 퍼센트 단위
  const [pendingQuestion, setPendingQuestion] = useState<string>('');
  const [contexts, setContexts] = useState<string[]>([]);

  const viewerRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const utils = useQueryClient();

  const {
    data: chat,
    isLoading,
    error,
  } = api.useQuery('get', '/v1/lectures/{lectureId}/qna-chat', {
    params: {
      path: {
        lectureId: lecture.id,
      },
    },
  });

  const createChatMutation = api.useMutation(
    'post',
    '/v1/lectures/{lectureId}/qna-chat',
    {
      onSuccess: () => {
        utils.invalidateQueries({
          queryKey: ['/v1/lectures/{lectureId}/qna-chat'],
          exact: true,
        });
        utils.invalidateQueries({
          queryKey: ['/v1/lectures/{lectureId}/qna-chat/messages'],
          exact: true,
        });
      },
    },
  );

  // 요약본 상태 polling 10 seconds
  useEffect(() => {
    const invalidate = setInterval(() => {
      if (lecture.summaryStatus !== 'completed') {
        utils.invalidateQueries({ queryKey: ['/v1/lectures/{id}'] });
      }
    }, 10000);

    return () => clearInterval(invalidate);
  }, [lecture.summaryStatus]);

  // 컨테이너 너비 감지
  useEffect(() => {
    const updateContainerWidth = () => {
      if (viewerRef.current) {
        setContainerWidth(viewerRef.current.offsetWidth - 32); // padding 제외
      }
    };

    updateContainerWidth();
    window.addEventListener('resize', updateContainerWidth);
    return () => window.removeEventListener('resize', updateContainerWidth);
  }, []);

  // 강의 노트 페이지 이동
  const noteMove = (page: number) => {
    if (page < 1 || page > numPages) return;
    const ref = pageRefs.current[page - 1];
    if (ref) {
      ref.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setPageNumber(page);
    }
  };

  // 초기 렌더링 시 페이지 설정
  const onDocumentLoadSuccess = (pdf: any) => {
    setNumPages(pdf.numPages);
    noteMove(1);
  };

  // 현재 보이는 페이지
  const setPageVisibility = useCallback(
    (page: number, isIntersecting: boolean) => {
      setVisiblePages((prevVisiblePages) => ({
        ...prevVisiblePages,
        [page]: isIntersecting,
      }));
    },
    [],
  );

  // 현재 페이지 설정
  useEffect(() => {
    const visiblePageNumbers = Object.entries(visiblePages)
      .filter(([, isVisible]) => isVisible)
      .map(([pageNum]) => Number.parseInt(pageNum))
      .sort((a, b) => a - b);

    if (visiblePageNumbers.length > 0) {
      setPageNumber(visiblePageNumbers[0]);
    }
  }, [visiblePages]);

  const handleResize = useCallback((deltaX: number) => {
    const containerElement = viewerRef.current?.parentElement;
    if (!containerElement) return;

    const containerWidth = containerElement.offsetWidth;
    const deltaPercent = (deltaX / 3 / containerWidth) * 100;

    setLeftPanelWidth((prev) => {
      const newWidth = prev + deltaPercent;
      return Math.max(20, Math.min(80, newWidth)); // 20%~80% 제한
    });
  }, []);

  const isSelectionInSummary = (selection: Selection): boolean => {
    if (!selection.rangeCount || !summaryRef.current) return false;

    const range = selection.getRangeAt(0);
    const commonAncestor = range.commonAncestorContainer;

    // 선택된 텍스트의 부모 요소가 요약본 영역 안에 있는지 확인
    let element =
      commonAncestor.nodeType === Node.TEXT_NODE
        ? commonAncestor.parentElement
        : (commonAncestor as Element);

    while (element) {
      if (element === summaryRef.current) {
        return true;
      }
      element = element.parentElement;
    }

    return false;
  };

  const addContext = (text: string) => {
    setContexts((prev) => [...prev, text]);
  };

  const removeContext = (index: number) => {
    setContexts((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        setSelectionText('');
        setToolbarPos(null);
        return;
      }
      const text = sel.toString().trim();
      if (!text) {
        setSelectionText('');
        setToolbarPos(null);
        return;
      }

      // 선택 영역의 첫 번째 Range 가져오기
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // 선택된 텍스트가 요약본 영역에 있는지 확인
      const isInSummary = isSelectionInSummary(sel);

      let containerRect = { top: 0, left: 0 };

      if (isInSummary && summaryRef.current) {
        // 요약본 영역의 경우 요약본 컨테이너를 기준으로 계산
        containerRect = summaryRef.current.getBoundingClientRect();
      } else if (viewerRef.current) {
        // PDF 뷰어 영역의 경우 기존대로 계산
        containerRect = viewerRef.current.getBoundingClientRect();
      }

      setToolbarPos({
        top: rect.top - containerRect.top - 40, // 툴바 높이만큼 위로 띄우기
        left: rect.left - containerRect.left,
      });
      setSelectionText(text);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  return (
    <div className="flex max-h-[calc(100dvh-8rem)] min-h-0 flex-1 gap-4">
      {/* PDF 뷰어 카드 */}
      <div
        style={{ width: `${leftPanelWidth}%` }}
        className="relative flex min-h-0 flex-1 flex-col rounded-2xl bg-white shadow-lg"
      >
        {/* 툴바: scroll 영역 밖에 고정 */}
        <div className="z-10 flex flex-none items-center justify-between border-b bg-gray-100 px-4 py-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setScale((s) => Math.max(s - 0.1, 0.5))}
              className="rounded p-1 hover:bg-gray-200"
            >
              <Minus size={16} />
            </button>
            <span className="w-12 text-center text-sm font-medium">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale((s) => Math.min(s + 0.1, 2))}
              className="rounded p-1 hover:bg-gray-200"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                noteMove(Math.max(pageNumber - 1, 1));
              }}
              className="rounded p-1 hover:bg-gray-200"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-medium">
              {pageNumber} / {numPages}
            </span>
            <button
              onClick={() => {
                noteMove(Math.min(pageNumber + 1, numPages));
              }}
              className="rounded p-1 hover:bg-gray-200"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* 스크롤 가능한 PDF 문서 영역 */}
        <div className="flex-1 overflow-auto p-4">
          {lecture.materialUrl ? (
            <Document
              file={lecture.materialUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="p-6 text-center text-gray-500">로딩 중...</div>
              }
              error={
                <div className="p-6 text-center text-red-500">
                  PDF를 불러올 수 없습니다.
                </div>
              }
              inputRef={viewerRef}
            >
              {Array.from({ length: numPages }, (_, idx) => (
                <div
                  key={idx}
                  ref={(el) => {
                    pageRefs.current[idx] = el;
                  }}
                  className="mb-4 flex justify-center"
                >
                  <PageWithObserver
                    pageNumber={idx + 1}
                    setPageVisibility={setPageVisibility}
                    width={containerWidth * scale}
                    renderAnnotationLayer
                    renderTextLayer
                    className="rounded bg-white shadow-sm"
                  />
                </div>
              ))}
            </Document>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <div className="flex h-96 w-full items-center justify-center rounded-lg bg-gray-100">
                <div className="text-center">
                  <div className="mb-4 text-4xl">📄</div>
                  <div>PDF 파일이 없습니다</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 질문하기 버튼: 툴바, 문서 영역과 별도로 absolute */}
        <button
          onClick={() => {
            if (chat) {
              setIsChatOpen(true);
            } else {
              createChatMutation.mutate(
                {
                  params: {
                    path: {
                      lectureId: lecture.id,
                    },
                  },
                },
                {
                  onSuccess: (data) => {
                    setIsChatOpen(true);
                  },
                },
              );
            }
          }}
          className={clsx(
            'absolute bottom-4 left-4 z-20 flex items-center gap-x-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-md transition-colors',
            isChatOpen
              ? 'bg-gray-600 hover:bg-gray-700'
              : 'bg-blue-600 hover:bg-blue-700',
          )}
        >
          <MessageSquare size={16} />
          질문하기
        </button>

        {chat && (
          <ChatWidget
            lectureId={lecture.id}
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            contexts={contexts}
            removeContext={removeContext}
          />
        )}

        {toolbarPos && !isSelectionInSummary(window.getSelection()!) && (
          <div
            className="absolute z-10 flex w-fit items-center gap-x-2 rounded-md p-2 text-white shadow-lg"
            style={{
              top: toolbarPos.top - 4,
              left: toolbarPos.left,
              background: 'rgba(0,0,0,0.75)',
              zIndex: 10,
            }}
          >
            <button
              className="flex w-fit items-center gap-1"
              onClick={() => /* 번역 API 호출 */ null}
            >
              <Globe size={16} />
              <span className="whitespace-nowrap">번역하기</span>
            </button>
            <button
              className="flex w-fit items-center gap-1"
              onClick={() => /* 질문 모달 열기 */ null}
            >
              <MessageCircle size={16} />
              <span className="whitespace-nowrap">질문하기</span>
            </button>
          </div>
        )}
      </div>

      <ResizeHandle onResize={handleResize} />

      {/* 강의 요약 영역 */}
      <div
        ref={summaryRef}
        style={{ width: `${100 - leftPanelWidth}%` }}
        className="flex flex-col overflow-y-auto rounded-2xl bg-gray-50 p-4 shadow-inner"
      >
        {lecture.summaryStatus !== 'completed' ? (
          <SummaryPending />
        ) : (
          <LectureSummaryView
            summary={lecture.summary!}
            lectureId={lecture.id}
          />
        )}
      </div>
    </div>
  );
}

function PageWithObserver({
  pageNumber,
  setPageVisibility,
  width,
  className,
  renderAnnotationLayer,
  renderTextLayer,
  ...otherProps
}: {
  pageNumber: number;
  setPageVisibility: (page: number, isIntersecting: boolean) => void;
  width: number;
  className?: string;
  renderAnnotationLayer?: boolean;
  renderTextLayer?: boolean;
}) {
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);

  const onIntersectionChange = useCallback(
    ([entry]: IntersectionObserverEntry[]) => {
      setPageVisibility(pageNumber, entry.isIntersecting);
    },
    [pageNumber, setPageVisibility],
  );

  useIntersectionObserver(canvasEl, observerConfig, onIntersectionChange);

  return (
    <Page
      canvasRef={(el) => setCanvasEl(el)}
      pageNumber={pageNumber}
      className={className}
      width={width}
      renderAnnotationLayer
      renderTextLayer
      {...otherProps}
    />
  );
}

export function SummaryPending() {
  return (
    <div className="relative flex h-full basis-1/3 rounded-lg border bg-white p-4 shadow-md">
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
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
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
  );
}

export function LectureSummaryView({
  summary,
  lectureId,
}: {
  summary: components['schemas']['Summary'];
  lectureId: string;
}) {
  return (
    <div className="mx-auto h-full w-full max-w-4xl space-y-12 overflow-scroll px-4 py-8">
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
              {kw.pageRange && (
                <p className="text-sm text-gray-600">
                  📄 p.{kw.pageRange.startPage}~{kw.pageRange.endPage} | 관련도:{' '}
                  {kw.relevance}
                </p>
              )}
              <p className="mt-1">{kw.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-2xl font-bold">📖 참고 자료</h2>
        {summary.additionalReferences && (
          <ul className="list-inside list-disc">
            {summary.additionalReferences.map((ref, i) => (
              <li key={i}>{ref}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function TopicBlock({
  topic,
  level,
}: {
  topic: components['schemas']['TopicDetails'];
  level: number;
}) {
  return (
    <li className="border-l-4 border-blue-400 pl-4">
      <h3
        className={`mb-1 text-xl font-semibold ${level > 0 ? 'text-blue-600' : ''}`}
      >
        {topic.title}
      </h3>
      {topic.pageRange && (
        <p className="mb-1 text-sm text-gray-600">
          📄 p.{topic.pageRange.startPage}~{topic.pageRange.endPage}
        </p>
      )}
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
