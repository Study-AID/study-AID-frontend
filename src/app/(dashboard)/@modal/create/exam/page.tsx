'use client';

import { api } from '@/api/client';
import { Button } from '@/component/ui/button';
import { Checkbox } from '@/component/ui/checkbox';
import { Input } from '@/component/ui/input';
import { DialogTitle } from '@headlessui/react';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import ModalWrapper from '../../_components/ModalWrapper';

export default function CreateExamModal() {
  const searchParams = useSearchParams();

  const courseId = searchParams.get('courseId');

  if (courseId === null) {
    return null;
  }

  return <CreateExamModalContent courseId={courseId} />;
}

function CreateExamModalContent({ courseId }: { courseId: string }) {
  const router = useRouter();
  const utils = useQueryClient();
  const [selectedLectures, setSelectedLectures] = useState<string[]>([]);
  const { data: lectures } = api.useQuery(
    'get',
    `/v1/lectures/course/{courseId}`,
    {
      params: {
        path: {
          courseId: courseId,
        },
      },
    },
  );

  const [examName, setExamName] = useState<string>('');

  const [questionConfig, setQuestionConfig] = useState({
    trueOrFalseCount: 0,
    multipleChoiceCount: 0,
    shortAnswerCount: 0,
    essayCount: 0,
  });

  const createExamMutation = api.useMutation('post', '/v1/exams', {
    onError: (error) => {
      console.error('시험 생성 실패:', error);
    },
  });

  const handleCreateExam = () => {
    if (selectedLectures.length === 0) {
      alert('시험에 포함할 강의를 선택해주세요.');
      return;
    }

    //     {
    //   "courseId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    //   "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    //   "title": "string",
    //   "referencedLectures": [
    //     "3fa85f64-5717-4562-b3fc-2c963f66afa6"
    //   ],
    //   "trueOrFalseCount": 0,
    //   "multipleChoiceCount": 0,
    //   "shortAnswerCount": 0,
    //   "essayCount": 0
    // }

    createExamMutation.mutate(
      {
        body: {
          courseId: courseId,
          title: examName,
          referencedLectures: selectedLectures,
          ...questionConfig,
        },
      },
      {
        onSuccess: () => {
          utils.invalidateQueries({
            queryKey: [
              'get',
              `/v1/exams/course/{courseId}`,
              {
                params: {
                  path: {
                    courseId: courseId,
                  },
                },
              },
            ],
          });
          router.back();
        },
      },
    );
  };

  if (!lectures || !lectures.lectures) {
    return <div>Loading...</div>;
  }

  return (
    <ModalWrapper>
      <DialogTitle as="h3" className="text-lg leading-6 font-semibold">
        시험 과목 선택
      </DialogTitle>

      <div className="mt-6">
        <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Side - Lecture Selection */}
          <div className="flex h-full flex-col lg:col-span-2">
            <div className="flex h-full flex-col rounded-lg border border-[#e6e6e6] bg-white p-6">
              <div className="mb-6 flex flex-shrink-0 items-center justify-between">
                <h3 className="text-xl font-semibold text-[#1d1b20]">
                  강의 선택
                </h3>
                <div className="text-sm text-[#757575]">
                  {selectedLectures.length}개 선택됨
                </div>
              </div>

              {/* Search */}
              {/* <div className="mb-6">
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-[#757575]" />
                  <Input
                    placeholder="강의 제목으로 검색..."
                    className="border-[#e6e6e6] bg-[#f8f9fa] pl-10"
                  />
                </div>
              </div> */}

              {/* Lecture List */}
              <div className="h-full space-y-3 overflow-y-auto">
                {lectures.lectures.map((lecture) => {
                  const isCompleted = lecture.summaryStatus === 'completed';
                  const isSelected = selectedLectures.includes(lecture.id);

                  return (
                    <div
                      key={lecture.id}
                      className={`rounded-lg border-2 p-4 transition-all ${
                        isCompleted
                          ? `cursor-pointer hover:shadow-sm ${
                              isSelected
                                ? 'border-[#5971e7] bg-[#f0f2ff]'
                                : 'border-[#e6e6e6] hover:border-[#5971e7]'
                            }`
                          : 'cursor-not-allowed border-[#e6e6e6] bg-[#f5f5f5] opacity-60'
                      }`}
                      onClick={() => {
                        if (isCompleted) {
                          setSelectedLectures((prev) =>
                            prev.includes(lecture.id)
                              ? prev.filter((id) => id !== lecture.id)
                              : [...prev, lecture.id],
                          );
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isSelected}
                            disabled={!isCompleted}
                            className={`${isCompleted ? 'data-[state=checked]:border-[#5971e7] data-[state=checked]:bg-[#5971e7]' : 'cursor-not-allowed opacity-50'}`}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4
                                className={`font-medium ${isCompleted ? 'text-[#1d1b20]' : 'text-[#9e9e9e]'}`}
                              >
                                {lecture.title}
                              </h4>
                              {!isCompleted && (
                                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                                  {lecture.summaryStatus === 'not_started' &&
                                    '대기중'}
                                  {lecture.summaryStatus === 'in_progress' &&
                                    '처리중'}
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-sm ${isCompleted ? 'text-[#757575]' : 'text-[#9e9e9e]'}`}
                            >
                              {format(lecture.createdAt, 'yyyy-MM-dd')}
                            </p>
                            {!isCompleted && (
                              <p className="mt-1 text-xs text-[#9e9e9e]">
                                요약 완료 후 선택 가능합니다
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`${isCompleted ? 'text-[#757575] hover:text-[#5971e7]' : 'cursor-not-allowed text-[#9e9e9e]'}`}
                            disabled={!isCompleted}
                          >
                            <BookOpen className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Select All */}
              <div className="mt-4 border-t border-[#e6e6e6] pt-4">
                <Button
                  variant="ghost"
                  className="text-[#5971e7] hover:bg-[#f0f2ff]"
                  onClick={() => {
                    if (selectedLectures.length === lectures.lectures!.length) {
                      setSelectedLectures([]);
                    } else {
                      setSelectedLectures(lectures.lectures!.map((l) => l.id));
                    }
                  }}
                >
                  {selectedLectures.length === lectures.lectures.length
                    ? '전체 해제'
                    : '전체 선택'}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Side - Exam Settings & Preview */}
          <div className="space-y-6">
            {/* Selected Lectures Preview */}
            <div className="rounded-lg border border-[#e6e6e6] bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-[#1d1b20]">
                선택된 강의
              </h3>
              {selectedLectures.length === 0 ? (
                <div className="py-8 text-center text-[#757575]">
                  <BookOpen className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                  <p>강의를 선택해주세요</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedLectures.map((lectureId) => {
                    const lecture = lectures.lectures!.find(
                      (l) => l.id === lectureId,
                    );

                    return (
                      <div
                        key={lectureId}
                        className="flex items-center justify-between rounded bg-[#f8f9fa] p-2"
                      >
                        <span className="text-sm font-medium">
                          {lecture!.title}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-[#757575] hover:text-red-500"
                          onClick={() =>
                            setSelectedLectures((prev) =>
                              prev.filter((id) => id !== lectureId),
                            )
                          }
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-[#e6e6e6] bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-[#1d1b20]">
                주요 키워드
              </h3>

              {selectedLectures.length === 0 ? (
                <div className="py-4 text-center text-[#757575]">
                  <p>강의를 선택하면 주요 키워드가 표시됩니다</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedLectures
                    .flatMap((lectureId) => {
                      const lecture = lectures.lectures!.find(
                        (l) => l.id === lectureId,
                      );
                      return (
                        lecture!.summary!.keywords!.map((ks) => ks.keyword) ||
                        []
                      );
                    })
                    .filter(
                      (keyword, index, self) => self.indexOf(keyword) === index,
                    ) // 중복 제거
                    .map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-[#5971e7] px-2 py-1 text-xs font-medium text-white"
                      >
                        {keyword}
                      </span>
                    ))}
                </div>
              )}

              <div className="mt-6 rounded-lg bg-[#f0f2ff] p-3">
                <p className="text-sm text-[#5971e7]">
                  💡 선택한 강의의 키워드를 바탕으로 AI가 맞춤형 문제를
                  생성합니다
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-[#e6e6e6] bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-[#1d1b20]">
                시험 설정
              </h3>

              <div className="space-y-4">
                {/* Exam Name */}
                <div>
                  <label
                    htmlFor="examName"
                    className="mb-2 block text-sm font-medium text-[#1d1b20]"
                  >
                    시험 이름
                  </label>
                  <input
                    id="examName"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    placeholder="시험 이름을 입력하세요"
                    className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                  />
                </div>

                {/* Question Type Configuration */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1d1b20]">
                    문제 유형별 갯수
                  </label>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">O/X 문제</span>
                      <div className="flex items-center">
                        <button
                          type="button"
                          className="h-8 w-8 rounded-r-none border bg-white hover:bg-gray-50"
                          onClick={() =>
                            setQuestionConfig((prev) => ({
                              ...prev,
                              trueOrFalseCount: Math.max(
                                0,
                                prev.trueOrFalseCount - 1,
                              ),
                            }))
                          }
                        >
                          -
                        </button>
                        <input
                          value={questionConfig.trueOrFalseCount}
                          onChange={(e) => {
                            const value = Number.parseInt(e.target.value) || 0;
                            setQuestionConfig((prev) => ({
                              ...prev,
                              trueOrFalseCount: value,
                            }));
                          }}
                          className="h-8 w-16 border-x-0 border-y text-center"
                        />
                        <button
                          type="button"
                          className="h-8 w-8 rounded-l-none border bg-white hover:bg-gray-50"
                          onClick={() =>
                            setQuestionConfig((prev) => ({
                              ...prev,
                              trueOrFalseCount: prev.trueOrFalseCount + 1,
                            }))
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">4지선다 문제</span>
                      <div className="flex items-center">
                        <button
                          type="button"
                          className="h-8 w-8 rounded-r-none border bg-white hover:bg-gray-50"
                          onClick={() =>
                            setQuestionConfig((prev) => ({
                              ...prev,
                              multipleChoiceCount: Math.max(
                                0,
                                prev.multipleChoiceCount - 1,
                              ),
                            }))
                          }
                        >
                          -
                        </button>
                        <input
                          value={questionConfig.multipleChoiceCount}
                          onChange={(e) => {
                            const value = Number.parseInt(e.target.value) || 0;
                            setQuestionConfig((prev) => ({
                              ...prev,
                              multipleChoiceCount: value,
                            }));
                          }}
                          className="h-8 w-16 border-x-0 border-y text-center"
                        />
                        <button
                          type="button"
                          className="h-8 w-8 rounded-l-none border bg-white hover:bg-gray-50"
                          onClick={() =>
                            setQuestionConfig((prev) => ({
                              ...prev,
                              multipleChoiceCount: prev.multipleChoiceCount + 1,
                            }))
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">단답형 문제</span>
                      <div className="flex items-center">
                        <button
                          type="button"
                          className="h-8 w-8 rounded-r-none border bg-white hover:bg-gray-50"
                          onClick={() =>
                            setQuestionConfig((prev) => ({
                              ...prev,
                              shortAnswerCount: Math.max(
                                0,
                                prev.shortAnswerCount - 1,
                              ),
                            }))
                          }
                        >
                          -
                        </button>
                        <input
                          value={questionConfig.shortAnswerCount}
                          onChange={(e) => {
                            const value = Number.parseInt(e.target.value) || 0;
                            setQuestionConfig((prev) => ({
                              ...prev,
                              shortAnswerCount: value,
                            }));
                          }}
                          className="h-8 w-16 border-x-0 border-y text-center"
                        />
                        <button
                          type="button"
                          className="h-8 w-8 rounded-l-none border bg-white hover:bg-gray-50"
                          onClick={() =>
                            setQuestionConfig((prev) => ({
                              ...prev,
                              shortAnswerCount: prev.shortAnswerCount + 1,
                            }))
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">서술형 문제</span>
                      <div className="flex items-center">
                        <button
                          type="button"
                          className="h-8 w-8 rounded-r-none border bg-white hover:bg-gray-50"
                          onClick={() =>
                            setQuestionConfig((prev) => ({
                              ...prev,
                              essayCount: Math.max(0, prev.essayCount - 1),
                            }))
                          }
                        >
                          -
                        </button>
                        <input
                          value={questionConfig.essayCount}
                          onChange={(e) => {
                            const value = Number.parseInt(e.target.value) || 0;
                            setQuestionConfig((prev) => ({
                              ...prev,
                              essayCount: value,
                            }));
                          }}
                          className="h-8 w-16 border-x-0 border-y text-center"
                        />
                        <button
                          type="button"
                          className="h-8 w-8 rounded-l-none border bg-white hover:bg-gray-50"
                          onClick={() =>
                            setQuestionConfig((prev) => ({
                              ...prev,
                              essayCount: prev.essayCount + 1,
                            }))
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-[#757575]">
                    총 문제 수:{' '}
                    {questionConfig.trueOrFalseCount +
                      questionConfig.multipleChoiceCount +
                      questionConfig.shortAnswerCount +
                      questionConfig.essayCount}
                    문항
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            className="px-6"
            onClick={() => router.back()}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            이전 단계
          </Button>
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="px-6"
              onClick={() => router.back()}
            >
              취소
            </Button>
            <Button
              className="cursor-pointer bg-[#5971e7] px-6 text-white hover:bg-[#4a5fd1]"
              disabled={selectedLectures.length === 0}
              onClick={handleCreateExam}
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              시험 생성하기
            </Button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
