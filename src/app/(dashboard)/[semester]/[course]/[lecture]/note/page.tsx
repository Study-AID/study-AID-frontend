'use client';

import { components } from '@/types/openapi.schema';
import { keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { useIntersectionObserver } from '@wojtekmaj/react-hooks';
import clsx from 'clsx';
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  Heart,
  MessageCircle,
  MessageCircleQuestion,
  MessageSquare,
  Minus,
  Plus,
  Send,
  X,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { api } from '@/api/client';
import { useParams } from 'next/navigation';
import { translate } from './translate';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const observerConfig = {
  threshold: 0,
};

export default function NotePage() {
  const params = useParams();

  const lectureId = params.lecture as string;

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

  return <NoteComponent lecture={data} />;
}

function ResizeHandle({ onResize }: { onResize: (deltaX: number) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const lastMouseX = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.movementX;
        onResize(deltaX);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = '';
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
    e.preventDefault(); // 텍스트 선택 방지
    document.body.style.userSelect = 'none';
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
  isPending,
  handleSendMessage,
  recommendedQuestions,
}: {
  lectureId: string;
  isOpen: boolean;
  onClose: () => void;
  contexts?: string[];
  removeContext: (index: number) => void;
  isPending: boolean;
  handleSendMessage: (text: string) => void;
  recommendedQuestions: string[];
}) {
  const utils = useQueryClient();

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
      placeholderData: keepPreviousData,
    },
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
          references: undefined,
          isLiked: false,
        },
      ];
    return messagesData?.messages || [];
  }, [isLoading, error, messagesData]);

  useEffect(() => {
    scrollToBottom();
  }, []);

  const chatLikeMutation = api.useMutation(
    'post',
    '/v1/lectures/{lectureId}/qna-chat/messages/{messageId}/toggle-like',
    {
      meta: {
        isBackgroundTask: true,
      },
    },
  );

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputText);

      scrollToBottom();
    }
  };

  const handleAddHighlightToInput = (text: string) => {
    const currentText = inputText;
    const newText = currentText ? `${currentText} "${text}"` : `"${text}"`;
    setInputText(newText);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-16 left-4 z-30 flex h-[34rem] w-[26rem] flex-col rounded-lg border border-gray-200 bg-white shadow-2xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between rounded-t-lg bg-[#5971e7] p-3 text-white">
        <h3 className="text-sm font-semibold">QnA Chat</h3>
        <button
          onClick={onClose}
          className="cursor-pointer text-white transition-colors hover:text-gray-200"
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
                'flex flex-col justify-end gap-1',
                message.role === 'user' ? 'items-end' : 'items-start',
              )}
            >
              <div
                className={clsx(
                  'flex items-end gap-1',
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row',
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
                </div>
                {message.role !== 'user' && (
                  <Heart
                    className={clsx(
                      'ml-1 inline h-4 w-4 cursor-pointer',
                      message.isLiked ? 'text-red-500' : 'text-gray-400',
                    )}
                    fill="currentColor"
                    onClick={() => {
                      chatLikeMutation.mutate(
                        {
                          params: {
                            path: {
                              lectureId: lectureId,
                              messageId: message.messageId,
                            },
                          },
                        },
                        {
                          onSuccess: () => {
                            utils.setQueryData(
                              [
                                'get',
                                '/v1/lectures/{lectureId}/qna-chat/messages',
                                { params: { lectureId } },
                              ],
                              (old: typeof messagesData) => {
                                if (!old) return old;
                                return {
                                  ...old,
                                  messages: old.messages.map((m) =>
                                    m.messageId === message.messageId
                                      ? { ...m, isLiked: !m.isLiked }
                                      : m,
                                  ),
                                };
                              },
                            );
                          },
                        },
                      );
                    }}
                  />
                )}
              </div>

              {/* 출처 */}
              {message.references && (
                <div className="max-w-[85%]">
                  <div className="flex gap-x-1 overflow-x-scroll">
                    {message.references.map((ref, index) => (
                      <div
                        key={`${message.messageId}-ref-${index}`}
                        className="mt-1 flex max-h-16 max-w-24 flex-col gap-1 truncate rounded-sm bg-gray-100 p-1 text-xs text-gray-500"
                      >
                        <span className="text-[0.5rem]">
                          <span className="font-semibold">p.</span> {ref.page}
                        </span>
                        <div className="truncate">{ref.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        {(isPending ||
          (messages.length > 0 &&
            messages[messages.length - 1].role === 'user')) && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-gray-100 p-2 text-xs text-gray-800">
              답변을 생성하고 있습니다...
            </div>
          </div>
        )}
        {recommendedQuestions.length > 0 && (
          <div className="mt-2 flex max-w-[70%] flex-col gap-1">
            <span className="text-xs font-bold text-gray-500">
              이 질문이 좋아보여요!
            </span>
            {recommendedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => {
                  setInputText(question);
                }}
                className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-gray-200"
              >
                {question}
              </button>
            ))}
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
                  className="ml-2 cursor-pointer text-gray-400 hover:text-red-500"
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
            disabled={isPending}
          />
          <button
            onClick={() => {
              handleSendMessage(inputText);

              scrollToBottom();
            }}
            disabled={isPending || !inputText.trim()}
            className="rounded bg-[#5971e7] p-2 text-white transition-colors hover:bg-[#4a5fd1] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

function NoteComponent({
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
  const [contexts, setContexts] = useState<string[]>([]);

  const [isPending, startTransition] = useTransition();
  const [translationResult, setTranslationResult] = useState<string>('');
  const [showTranslation, setShowTranslation] = useState(false);
  const [translationText, setTranslationText] = useState<string>(''); // 번역할 텍스트 저장
  const [translationPos, setTranslationPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [pendingTranslation, setPendingTranslation] = useState<{
    text: string;
    position: { top: number; left: number };
  } | null>(null);

  const [recommendedQuestions, setRecommendedQuestions] = useState<string[]>(
    [],
  );

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
          queryKey: [
            'get',
            '/v1/lectures/{lectureId}/qna-chat',
            {
              params: {
                path: {
                  lectureId: lecture.id,
                },
              },
            },
          ],
          exact: true,
        });
        utils.invalidateQueries({
          queryKey: [
            'get',
            '/v1/lectures/{lectureId}/qna-chat/messages',
            {
              params: {
                path: {
                  lectureId: lecture.id,
                },
              },
            },
          ],
          exact: true,
        });
      },
      meta: {
        isBackgroundTask: true,
      },
    },
  );

  // 채팅방 생성시 자동으로 열기
  useEffect(() => {
    if (chat && !isLoading && !error) {
      setIsChatOpen(true);
    }
  }, [chat, isLoading, error]);

  // 요약본 상태 polling 10 seconds
  useEffect(() => {
    const invalidate = setInterval(() => {
      if (lecture.summaryStatus !== 'completed') {
        utils.invalidateQueries({
          queryKey: [
            'get',
            '/v1/lectures/{id}',
            {
              params: {
                path: {
                  id: lecture.id,
                },
              },
            },
          ],
        });
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
    const deltaPercent = (deltaX / containerWidth) * 100;

    setLeftPanelWidth((prev) => {
      const newWidth = prev + deltaPercent;
      return Math.max(20, Math.min(80, newWidth)); // 20%~80% 제한
    });
  }, []);

  const updateTooltipPosition = () => {
    const sel = window.getSelection();

    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      setToolbarPos(null);
      setSelectionText('');
      setShowTranslation(false); // 번역 결과도 함께 숨기기
      setTranslationResult('');
      return;
    }

    const text = sel.toString().trim();
    if (!text || text.length < 2) {
      setToolbarPos(null);
      setSelectionText('');
      return;
    }

    try {
      const range = sel.getRangeAt(0);
      const rects = range.getClientRects();

      if (!rects.length) {
        setToolbarPos(null);
        return;
      }

      // 최상위 컨테이너 (relative 포지션을 가진 부모) 찾기
      const mainContainer = document.querySelector(
        '.relative.flex.max-h-\\[calc\\(100dvh-8rem\\)\\]',
      ) as HTMLElement;
      if (!mainContainer) {
        return;
      }

      const lastRect = rects[rects.length - 1];
      const mainContainerRect = mainContainer.getBoundingClientRect();

      // 선택 영역의 뷰포트 기준 위치
      const selectionBottom = lastRect.bottom;
      const selectionCenterX = lastRect.left + lastRect.width / 2;

      // 메인 컨테이너 기준 상대 위치로 변환
      const relativeTop = selectionBottom - mainContainerRect.top;
      const relativeLeft = selectionCenterX - mainContainerRect.left;

      // 툴팁 위치 계산
      const TOOLTIP_WIDTH = 140;
      const TOOLTIP_HEIGHT = 36;
      const MARGIN = 8;

      let finalTop = relativeTop + MARGIN;
      let finalLeft = relativeLeft;

      // 경계 체크 (메인 컨테이너 기준)
      const containerWidth = mainContainer.offsetWidth;
      const containerHeight = mainContainer.offsetHeight;

      // 좌우 경계
      if (finalLeft < TOOLTIP_WIDTH / 2 + 16) {
        finalLeft = TOOLTIP_WIDTH / 2 + 16;
      } else if (finalLeft > containerWidth - TOOLTIP_WIDTH / 2 - 16) {
        finalLeft = containerWidth - TOOLTIP_WIDTH / 2 - 16;
      }

      // 하단 경계
      if (finalTop + TOOLTIP_HEIGHT > containerHeight - 16) {
        finalTop = relativeTop - MARGIN - TOOLTIP_HEIGHT;
        if (finalTop < 16) {
          finalTop = Math.max(16, relativeTop - TOOLTIP_HEIGHT / 2);
        }
      }

      setToolbarPos({ top: finalTop, left: finalLeft });
      setSelectionText(text);
    } catch (error) {
      setToolbarPos(null);
      setSelectionText('');
    }
  };

  const addContext = (text: string) => {
    setContexts((prev) => [...prev, text]);
  };

  const removeContext = (index: number) => {
    setContexts((prev) => prev.filter((_, i) => i !== index));
  };

  const resetContext = () => {
    setContexts([]);
  };

  //툴팁 위치 설정
  useEffect(() => {
    let selectionTimeout: NodeJS.Timeout | null = null;
    let isMouseDown = false;
    let isDragging = false;

    const debounceUpdateTooltip = () => {
      if (selectionTimeout) {
        clearTimeout(selectionTimeout);
      }

      if (isMouseDown || isDragging) {
        setToolbarPos(null);
        setSelectionText('');
        return;
      }

      selectionTimeout = setTimeout(() => {
        updateTooltipPosition();
      }, 150);
    };

    const handleSelectionChange = () => {
      debounceUpdateTooltip();
    };

    const handleMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      isDragging = false;
      setToolbarPos(null);
      setSelectionText('');

      if (selectionTimeout) {
        clearTimeout(selectionTimeout);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isMouseDown) {
        isDragging = true;
        setToolbarPos(null);
        setSelectionText('');
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      const wasMouseDown = isMouseDown;
      isMouseDown = false;

      setTimeout(() => {
        isDragging = false;
        if (wasMouseDown) {
          debounceUpdateTooltip();
        }
      }, 50);
    };

    const handleDoubleClick = (e: MouseEvent) => {
      setTimeout(() => {
        debounceUpdateTooltip();
      }, 100);
    };

    const handleScroll = () => {
      setToolbarPos(null);

      if (selectionTimeout) {
        clearTimeout(selectionTimeout);
      }

      selectionTimeout = setTimeout(() => {
        const sel = window.getSelection();
        if (sel && !sel.isCollapsed && sel.toString().trim()) {
          updateTooltipPosition();
        }
      }, 100);
    };

    // 이벤트 리스너 등록
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('dblclick', handleDoubleClick);

    const pdfViewer = viewerRef.current;
    const summaryPanel = summaryRef.current;

    if (pdfViewer) {
      pdfViewer.addEventListener('scroll', handleScroll, true);
    }
    if (summaryPanel) {
      summaryPanel.addEventListener('scroll', handleScroll, true);
    }

    return () => {
      if (selectionTimeout) {
        clearTimeout(selectionTimeout);
      }

      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('dblclick', handleDoubleClick);

      if (pdfViewer) {
        pdfViewer.removeEventListener('scroll', handleScroll, true);
      }
      if (summaryPanel) {
        summaryPanel.removeEventListener('scroll', handleScroll, true);
      }
    };
  }, []);

  // 4. 번역 결과 닫기 함수
  const closeTranslation = useCallback(() => {
    setShowTranslation(false);
    setTranslationResult('');
    setTranslationText('');
    setTranslationPos(null);
  }, []);

  useEffect(() => {
    if (pendingTranslation) {
      const { text, position } = pendingTranslation;

      // 상태 설정
      setTranslationText(text);
      setTranslationPos(position);
      setShowTranslation(true);
      setTranslationResult('');

      // 툴팁 숨기기
      setToolbarPos(null);
      setSelectionText('');

      // 번역 실행
      startTransition(async () => {
        try {
          const result = await translate(text);
          setTranslationResult(result as string);
        } catch (error) {
          setTranslationResult('번역에 실패했습니다: ' + error.message);
        }
      });

      // 펜딩 상태 초기화
      setPendingTranslation(null);
    }
  }, [pendingTranslation]);

  const questionMutation = api.useMutation(
    'post',
    '/v1/lectures/{lectureId}/qna-chat/messages',
  );

  const handleSendMessage = (inputText: string) => {
    if (!inputText.trim()) return;

    questionMutation.mutate(
      {
        params: {
          path: {
            lectureId: lecture.id,
          },
        },
        body: {
          question:
            contexts && contexts.length > 0
              ? `\`\`\`\n${contexts.join('\n---\n')}\n\`\`\` \n ${inputText}`
              : `${inputText}`,
        },
      },
      {
        onSuccess: (data: components['schemas']['QnaChatMessageResponse']) => {
          resetContext();
          setRecommendedQuestions([]);
          utils.invalidateQueries({
            queryKey: [
              'get',
              '/v1/lectures/{lectureId}/qna-chat/messages',
              {
                params: {
                  path: {
                    lectureId: lecture.id,
                  },
                },
              },
            ],
          });
          setRecommendedQuestions(data.recommendedQuestions);
        },
      },
    );
  };

  return (
    <div className="relative flex max-h-[calc(100dvh-8rem)] min-h-0 flex-1 gap-4">
      {createChatMutation.isPending && (
        <div className="fixed bottom-4 left-1/2 z-50 flex w-fit -translate-x-1/2 items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white shadow-lg">
          <span>챗봇이 강의자료 분석을 시작했어요! 잠시만 기다려주세요...</span>
          <svg
            className="ml-2 h-6 w-6 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2.93 6.343A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3.93-1.595z"
            ></path>
          </svg>
        </div>
      )}
      {/* PDF 뷰어 카드 */}
      <div
        style={{ width: `${leftPanelWidth}%` }}
        className="relative flex min-h-0 flex-1 flex-col rounded-2xl bg-white shadow-lg"
        ref={viewerRef}
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
              className="[&_*::selection]:font-[sans-serif]"
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
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
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
            isPending={questionMutation.isPending}
            recommendedQuestions={recommendedQuestions}
            handleSendMessage={handleSendMessage}
          />
        )}
      </div>

      <ResizeHandle onResize={handleResize} />

      {/* 강의 요약 영역 */}
      <div
        ref={summaryRef}
        style={{ width: `${100 - leftPanelWidth}%` }}
        className="relative flex flex-col overflow-y-auto rounded-2xl bg-gray-50 p-4 shadow-inner"
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

      {toolbarPos && selectionText && (
        <div
          className="absolute z-50"
          style={{
            top: `${toolbarPos.top}px`,
            left: `${toolbarPos.left}px`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="pointer-events-auto flex w-fit items-center rounded-md border border-gray-700/50 bg-gray-900/95 px-1.5 py-1 text-white shadow-xl backdrop-blur-sm">
            <button
              className="flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 text-xs transition-colors hover:bg-gray-700/50"
              onMouseDown={(e) => {
                // 이벤트 전파 완전 차단
                e.preventDefault();
                e.stopPropagation();

                if (toolbarPos && selectionText) {
                  // 즉시 번역 처리
                  setPendingTranslation({
                    text: selectionText,
                    position: toolbarPos,
                  });
                }

                return false;
              }}
              disabled={isPending}
            >
              <Globe size={12} />
              <span>{isPending ? '번역 중...' : '번역하기'}</span>
            </button>
            <div className="mx-0.5 h-3 w-px bg-gray-600" />
            <button
              className="flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 text-xs transition-colors hover:bg-gray-700/50"
              onMouseDown={(e) => {
                // 이벤트 전파 완전 차단
                e.preventDefault();
                e.stopPropagation();

                addContext(selectionText);
                if (chat) {
                  setIsChatOpen(true);
                } else {
                  createChatMutation.mutate({
                    params: {
                      path: {
                        lectureId: lecture.id,
                      },
                    },
                  });
                }
                setToolbarPos(null);
                setSelectionText('');

                return false;
              }}
            >
              <MessageCircle size={12} />
              <span>질문하기</span>
            </button>
            <div className="mx-0.5 h-3 w-px bg-gray-600" />
            <button
              className="flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 text-xs transition-colors hover:bg-gray-700/50"
              onMouseDown={(e) => {
                // 이벤트 전파 완전 차단
                e.preventDefault();
                e.stopPropagation();

                addContext(selectionText);
                if (chat) {
                  setIsChatOpen(true);
                } else {
                  createChatMutation.mutate({
                    params: {
                      path: {
                        lectureId: lecture.id,
                      },
                    },
                  });
                }

                handleSendMessage('위 개념에 대해 자세히 설명해줘');
                resetContext();
                setToolbarPos(null);
                setSelectionText('');

                return false;
              }}
              disabled={questionMutation.isPending}
            >
              <MessageCircleQuestion size={12} />
              <span>자세히</span>
            </button>
          </div>
        </div>
      )}

      {showTranslation && translationPos && (
        <div
          className="pointer-events-none absolute z-50"
          style={{
            top: `${translationPos.top + 50}px`,
            left: `${translationPos.left}px`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="pointer-events-auto w-xs rounded-lg border border-gray-200 bg-white p-3 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                번역 결과
              </span>
              <button
                onClick={closeTranslation}
                className="cursor-pointer text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            </div>

            {/* 원문 */}
            <div className="mb-2 rounded bg-gray-50 p-2">
              <div className="mb-1 text-xs text-gray-500">원문</div>
              <div className="text-sm text-gray-800">{translationText}</div>
            </div>

            {/* 번역 결과 */}
            <div className="rounded bg-blue-50 p-2">
              <div className="mb-1 text-xs text-blue-600">한국어</div>
              <div className="text-sm text-blue-800">
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                    <span>번역 중...</span>
                  </div>
                ) : translationResult ? (
                  translationResult
                ) : (
                  <span className="text-gray-500">
                    번역 결과를 기다리는 중...
                  </span>
                )}
              </div>
            </div>

            {/* 복사 버튼 */}
            {translationResult && !isPending && (
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(translationResult);
                  } catch (error) {}
                }}
                className="mt-2 w-full rounded bg-blue-600 py-1.5 text-xs text-white transition-colors hover:bg-blue-700"
              >
                번역 결과 복사
              </button>
            )}
          </div>
        </div>
      )}
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
