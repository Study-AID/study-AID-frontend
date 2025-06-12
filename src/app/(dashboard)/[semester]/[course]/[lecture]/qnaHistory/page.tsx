'use client';

import { api } from '@/api/client';
import { components } from '@/types/openapi.schema';
import { keepPreviousData, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  Heart,
  MessageCircle,
  Search,
  ThumbsUp,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function QnAHistoryPage() {
  const params = useParams();

  const lectureId = params.lecture as string;

  const { data, isLoading, error } = api.useQuery(
    'get',
    '/v1/lectures/{lectureId}/qna-chat/messages/liked',
    {
      params: {
        path: {
          lectureId: lectureId,
        },
      },
    },
    {
      placeholderData: keepPreviousData,
    },
  );

  if (isLoading || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-lg font-semibold text-gray-700">Loading...</span>
      </div>
    );
  }

  return <QnAHistory answers={data.messages} lectureId={lectureId} />;
}

function QnAHistory({
  answers,
  lectureId,
}: {
  answers: components['schemas']['GetQnaChatMessagesResponse']['messages'];
  lectureId: string;
}) {
  const utils = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(
    new Set(),
  );

  // Filter messages based on search term and date
  const filteredAnswers = useMemo(() => {
    return answers.filter((message) => {
      const matchesSearch = message.content
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const messageDate = new Date(message.createdAt)
        .toISOString()
        .split('T')[0];
      const matchesDate = selectedDate ? messageDate === selectedDate : true;
      return matchesSearch && matchesDate;
    });
  }, [searchTerm, selectedDate, answers]);

  const chatLikeMutation = api.useMutation(
    'post',
    '/v1/lectures/{lectureId}/qna-chat/messages/{messageId}/toggle-like',
    {
      meta: {
        isBackgroundTask: true,
      },
    },
  );

  const toggleExpanded = (messageId: string) => {
    const newExpanded = new Set(expandedMessages);
    if (newExpanded.has(messageId)) {
      newExpanded.delete(messageId);
    } else {
      newExpanded.add(messageId);
    }
    setExpandedMessages(newExpanded);
  };

  const unlike = (messageId: string) => {
    chatLikeMutation.mutate(
      {
        params: {
          path: {
            lectureId: lectureId,
            messageId: messageId,
          },
        },
      },
      {
        onSuccess: () => {
          utils.setQueryData(
            [
              'get',
              '/v1/lectures/{lectureId}/qna-chat/messages/liked',
              { params: { path: { lectureId } } },
            ],
            (oldData: components['schemas']['GetQnaChatMessagesResponse']) => {
              if (!oldData) return oldData;
              const newData = {
                ...oldData,
                messages: oldData.messages.filter((msg) => {
                  return msg.messageId !== messageId;
                }),
              };
              return newData;
            },
          );
          utils.invalidateQueries({
            queryKey: [
              'get',
              '/v1/lectures/{lectureId}/qna-chat/messages',
              { params: { path: { lectureId } } },
            ],
            exact: true,
          });
        },
      },
    );
  };

  return (
    <div className="mx-auto min-h-screen bg-gray-50 p-6">
      <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
        <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900">
          <MessageCircle className="text-blue-600" size={28} />
          QnA 답변 기록({filteredAnswers.length})
          <div className="relative ml-8 flex-1 text-lg">
            <Search
              className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="답변 내용으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative text-lg">
            <Calendar
              className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400"
              size={20}
            />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </h1>
      </div>

      {/* Answers List */}
      <div className="space-y-4">
        {filteredAnswers.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-sm">
            <MessageCircle className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-500">해당되는 결과가 없습니다.</p>
          </div>
        ) : (
          filteredAnswers.map((answer) => (
            <div
              key={answer.messageId}
              className="overflow-hidden rounded-lg bg-white shadow-sm"
            >
              {/* Date Header */}
              <div className="border-b bg-gradient-to-r from-blue-50 to-green-50 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {formatDate(answer.createdAt)}
                  </div>
                </div>
              </div>

              {/* Answer Content */}
              <div className="p-6">
                <div className="mb-4 leading-relaxed whitespace-pre-wrap text-gray-900">
                  {expandedMessages.has(answer.messageId) ||
                  answer.content.length <= 300
                    ? answer.content
                    : `${answer.content.slice(0, 300)}...`}
                </div>

                {answer.content.length > 300 && (
                  <button
                    onClick={() => toggleExpanded(answer.messageId)}
                    className="mb-4 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    {expandedMessages.has(answer.messageId) ? (
                      <>
                        <ChevronUp size={16} />
                        접기
                      </>
                    ) : (
                      <>
                        <ChevronDown size={16} />
                        더보기
                      </>
                    )}
                  </button>
                )}

                {/* References */}
                {answer.references && answer.references.length > 0 && (
                  <div className="mb-4">
                    <div className="mb-3 flex items-center gap-1 text-sm font-medium text-gray-700">
                      <FileText size={16} className="text-blue-600" />
                      참조 자료
                    </div>
                    <div className="grid gap-2">
                      {answer.references.map((ref, index) => (
                        <div
                          key={index}
                          className="rounded-lg border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 p-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              {ref.text && (
                                <div className="text-sm font-medium text-gray-700">
                                  {ref.text}
                                </div>
                              )}
                            </div>
                            {ref.page && (
                              <div className="rounded-full bg-blue-600 px-2 py-1 text-xs font-medium text-white">
                                p.{ref.page}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <button
                    onClick={() => unlike(answer.messageId)}
                    className={`flex cursor-pointer items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-200`}
                  >
                    <Heart size={16} className="fill-current" />
                    좋아요 취소
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
