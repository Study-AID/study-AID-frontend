'use client';

import { api } from '@/api/client';
import { Button } from '@/component/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/component/ui/card';
import { LayoutGrid, Plus, Router, Search } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { LectureList } from './_components/lecture';

const CircularProgress = ({
  value,
  total,
  size = 80,
}: {
  value: number;
  total: number;
  size?: number;
}) => {
  const percentage = (value / total) * 100;
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 transform">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e6e6e6"
          strokeWidth="6"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#5971e7"
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-bold text-[#1d1b20]">{value}</div>
          <div className="text-xs text-[#757575]">/{total}</div>
        </div>
      </div>
    </div>
  );
};

export default function CoursePage() {
  const params = useParams();
  const courseId = params.course as string;
  const semesterId = params.semester as string;

  return <CourseContent courseId={courseId} semesterId={semesterId} />;
}

function CourseContent({
  courseId,
  semesterId,
}: {
  courseId: string;
  semesterId: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = api.useQuery(
    'get',
    '/v1/lectures/course/{courseId}',
    {
      params: {
        path: {
          courseId: courseId,
        },
      },
    },
  );

  const { data: examData, isLoading: isExamLoading } = api.useQuery(
    'get',
    '/v1/exams/course/{courseId}',
    {
      params: {
        path: {
          courseId: courseId,
        },
      },
    },
    {
      refetchInterval: 10 * 1000,
      meta: {
        isBackgroundTask: true,
      },
    },
  );

  const lectures = useMemo(() => {
    if (!data || isLoading || !data.lectures) return [];

    if (search === '') return data.lectures;

    return data.lectures.filter((lecture) =>
      lecture.title.toLowerCase().includes(search.toLowerCase()),
    );
  }, [data, isLoading, search]);

  const exams = useMemo(() => {
    if (!examData || isExamLoading || !examData.exams) return [];

    return examData.exams.filter((exam) =>
      exam.title!.toLowerCase().includes(search.toLowerCase()),
    );
  }, [examData, isExamLoading]);

  if (!data || isLoading || !data.lectures || isExamLoading) {
    return <div>Loading...</div>;
  }

  if (error) return `An error occured: ${error}`;

  return (
    <main className="grid flex-1 grid-cols-[1.5fr_0.8fr] gap-6 overflow-auto">
      <div className="space-y-6">
        <DndProvider backend={HTML5Backend}>
          <LectureList
            courseId={courseId}
            semesterId={semesterId}
            initialLectures={lectures}
            search={search}
            setSearch={setSearch}
          />
        </DndProvider>

        <section className="rounded-lg bg-[#F7F7F7] shadow">
          <header className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="font-medium">모의 시험</h2>
            <Plus
              onClick={() => {
                router.push(`/create/exam?courseId=${courseId}`);
              }}
              className="cursor-pointer text-gray-600 hover:text-gray-800"
            />
          </header>
          <div className="flex justify-center p-8">
            {exams.length > 0 ? (
              exams.map((exam) => (
                <Card
                  className="cursor-pointer border-[#e6e6e6] transition-shadow hover:shadow-md"
                  onClick={() => {
                    router.push(
                      `/${semesterId}/${courseId}/exam/solve/${exam.id}`,
                    );
                  }}
                >
                  <CardContent className="flex flex-col items-center p-6">
                    <h3 className="mb-4 text-sm font-medium text-[#1d1b20]">
                      {exam.title}
                    </h3>
                    <CircularProgress value={90} total={100} size={80} />
                    <div className="mt-4 text-center">
                      <Button className="w-full bg-[#5971e7] text-sm text-white hover:bg-[#4a5fd1]">
                        상세 결과 보기
                      </Button>
                      <p className="mt-2 text-xs text-[#999999]">
                        {new Date(exam.createdAt!).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <button
                onClick={() => {
                  router.push(`/create/exam?courseId=${courseId}`);
                }}
                className="flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-gray-100 text-gray-400 hover:bg-gray-200"
              >
                <Plus size={32} />
                <span className="mt-2">모의 시험 추가하기</span>
              </button>
            )}
          </div>

          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-[#e6e6e6] hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 flex flex-col items-center">
                    <h3 className="text-sm font-medium text-[#1d1b20] mb-4">모의 중간고사</h3>
                    <CircularProgress value={90} total={100} size={80} />
                    <div className="mt-4 text-center">
                      <Button className="w-full bg-[#5971e7] hover:bg-[#4a5fd1] text-white text-sm">
                        상세 결과 보기
                      </Button>
                      <p className="text-xs text-[#999999] mt-2">2025.03.11 11:30:20</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#e6e6e6] hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 flex flex-col items-center">
                    <h3 className="text-sm font-medium text-[#1d1b20] mb-4">모의 중간고사</h3>
                    <CircularProgress value={90} total={100} size={80} />
                    <div className="mt-4 text-center">
                      <Button className="w-full bg-[#5971e7] hover:bg-[#4a5fd1] text-white text-sm">
                        상세 결과 보기
                      </Button>
                      <p className="text-xs text-[#999999] mt-2">2025.03.11 11:30:20</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#e6e6e6] bg-[#6b7280] hover:bg-[#5b6470] transition-colors cursor-pointer">
                  <CardContent className="p-6 h-full flex flex-col items-center justify-center text-white">
                    <div className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center mb-4">
                      <Plus className="w-5 h-5" />
                    </div>
                    <p className="text-center text-sm font-medium">모의 시험 추가하기</p>
                  </CardContent>
                </Card>
              </div> */}
        </section>

        <section className="rounded-lg bg-[#F7F7F7] shadow">
          <header className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="font-medium">활동 로그</h2>
            <LayoutGrid className="cursor-pointer text-gray-600 hover:text-gray-800" />
          </header>
          <div className="space-y-2 px-4 py-2">
            <div className="flex items-center gap-3 rounded-lg border border-[#e6e6e6] bg-white p-3 shadow-md">
              <div className="text-sm text-[#757575]">2025.03.13 11:30</div>
              <div className="text-sm text-[#1d1b20]">
                [강의 업로드] Processes
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-[#e6e6e6] bg-white p-3 shadow-md">
              <div className="text-sm text-[#757575]">2025.03.13 11:30</div>
              <div className="text-sm text-[#1d1b20]">
                [강의 업로드] Architectures
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-[#e6e6e6] bg-white p-3 shadow-md">
              <div className="text-sm text-[#757575]">2025.03.13 11:30</div>
              <div className="text-sm text-[#1d1b20]">
                [강의 업로드] Introduction
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="w-80 space-y-6 border-[#e6e6e6] bg-white">
        {/* 퀴즈 통계 */}
        <Card className="border-[#e6e6e6] bg-[#F7F7F7]">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-[#1d1b20]">
                퀴즈 통계
              </CardTitle>
              <Search className="h-4 w-4 text-[#757575]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex h-32 items-end justify-between">
              {[
                { day: '1일', height: 'h-16', color: 'bg-[#8b9cf7]' },
                { day: '2일', height: 'h-20', color: 'bg-[#7c8df5]' },
                { day: '3일', height: 'h-24', color: 'bg-[#6d7ef3]' },
                { day: '4일', height: 'h-28', color: 'bg-[#5e6ff1]' },
                { day: '5일', height: 'h-32', color: 'bg-[#4f60ef]' },
              ].map((bar, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-8 ${bar.height} ${bar.color} rounded-t`}
                  ></div>
                  <span className="text-xs text-[#757575]">{bar.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 여정 분석 및 공부 추천 */}
        <Card className="border-[#e6e6e6] bg-[#F7F7F7]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-[#1d1b20]">
              여정 분석 및 공부 추천
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-[#757575]">
              <p>아직 분석 데이터가 부족합니다</p>
            </div>
          </CardContent>
        </Card>

        {/* 학점 관리 */}
        <Card className="border-[#e6e6e6] bg-[#F7F7F7]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-[#1d1b20]">학점 관리</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="mb-1 text-sm text-[#757575]">목표 성적</p>
                <p className="text-xl font-bold text-[#1d1b20]">A+</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-[#757575]">취득 성적</p>
                <p className="text-xl font-bold text-[#1d1b20]">A</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-[#757575]">이수 학점</p>
                <p className="text-xl font-bold text-[#1d1b20]">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 성과 기록 */}
        <Card className="border-[#e6e6e6] bg-[#F7F7F7]">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-[#1d1b20]">
                성과 기록
              </CardTitle>
              <Button size="icon" variant="ghost" className="text-[#757575]">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 h-4 w-full rounded bg-[#5971e7]"></div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <p className="mb-1 text-[#757575]">평가 항목</p>
                  <p className="mb-1 text-[#757575]">만점</p>
                </div>
                <div>
                  <p className="mb-1 text-[#757575]">만점</p>
                  <p className="mb-1 text-[#757575]">점수: 10</p>
                </div>
                <div>
                  <p className="mb-1 text-[#757575]">점수</p>
                  <p className="mb-1 text-[#757575]">점수: 10</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-[#1d1b20]">출석</p>
                  <p className="text-sm text-[#1d1b20]">중간</p>
                </div>
                <div>
                  <p className="text-sm text-[#1d1b20]">10</p>
                  <p className="text-sm text-[#1d1b20]">30</p>
                </div>
                <div>
                  <p className="text-sm text-[#1d1b20]">10</p>
                  <p className="text-sm text-[#1d1b20]">25</p>
                </div>
              </div>
            </div>

            <Button className="mt-4 w-full bg-[#6b7280] text-white hover:bg-[#5b6470]">
              <Plus className="mr-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
