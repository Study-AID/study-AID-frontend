'use client';

import { api } from '@/api/client';
import { ExamCard } from '@/component/ExamCard';
import { Button } from '@/component/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/component/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/component/ui/dialog';
import { Input } from '@/component/ui/input';
import { Label } from '@/component/ui/label';
import { components } from '@/types/openapi.schema';
import { useQueryClient } from '@tanstack/react-query';
import {
  ChevronDown,
  LayoutGrid,
  Plus,
  Router,
  Save,
  Search,
  X,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { LectureList } from './_components/lecture';

const getGradeFromScore = (score?: number): string => {
  if (score === undefined) return '미설정';
  if (score >= 4.5) return 'A+';
  if (score >= 4.0) return 'A';
  if (score >= 3.5) return 'B+';
  if (score >= 3.0) return 'B';
  if (score >= 2.5) return 'C+';
  if (score >= 2.0) return 'C';
  if (score >= 1.5) return 'D+';
  if (score >= 1.0) return 'D';
  return '미설정';
};

// 등급을 점수로 변환하는 함수
const getScoreFromGrade = (grade: string): number => {
  switch (grade) {
    case 'A+':
      return 4.5;
    case 'A':
      return 4.0;
    case 'B+':
      return 3.5;
    case 'B':
      return 3.0;
    case 'C+':
      return 2.5;
    case 'C':
      return 2.0;
    case 'D+':
      return 1.5;
    case 'D':
      return 1.0;
    case 'F':
      return 0.0;
    default:
      return 0.0;
  }
};

function GradeEditModal({
  course,
  trigger,
}: {
  course: components['schemas']['Course'];
  trigger: React.ReactNode;
}) {
  const [editingCourse, setEditingCourse] =
    useState<components['schemas']['Course']>(course);
  const [isOpen, setIsOpen] = useState(false);
  const utils = useQueryClient();

  const updateMutation = api.useMutation('put', '/v1/courses/{id}/grades', {
    onSuccess: () => {
      utils.setQueryData(
        ['get', '/v1/courses/{id}', { params: { path: { id: course.id } } }],
        (oldData: any) => {
          return {
            ...oldData,
            targetGrade: editingCourse.targetGrade,
            earnedGrade: editingCourse.earnedGrade,
            completedCredits: editingCourse.completedCredits,
          };
        },
      );
      setIsOpen(false);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      params: { path: { id: course.id! } },
      body: {
        targetGrade: editingCourse.targetGrade,
        earnedGrade: editingCourse.earnedGrade,
        completedCredits: editingCourse.completedCredits,
      },
    });
  };

  const handleCancel = () => {
    setEditingCourse(course);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>학점 관리 수정</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="targetGrade" className="text-sm font-medium">
                목표 성적
              </Label>
              <div className="relative mt-1">
                <select
                  className="border-input bg-background ring-offset-background focus:ring-ring flex h-10 w-full appearance-none items-center justify-between rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  value={getGradeFromScore(editingCourse.targetGrade)}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      targetGrade: getScoreFromGrade(e.target.value),
                    })
                  }
                >
                  <option value="미설정">선택하세요</option>
                  <option value="A+">A+ (4.5)</option>
                  <option value="A">A (4.0)</option>
                  <option value="B+">B+ (3.5)</option>
                  <option value="B">B (3.0)</option>
                  <option value="C+">C+ (2.5)</option>
                  <option value="C">C (2.0)</option>
                  <option value="D+">D+ (1.5)</option>
                  <option value="D">D (1.0)</option>
                  <option value="F">F (0.0)</option>
                </select>
                <ChevronDown className="pointer-events-none absolute top-3 right-3 h-4 w-4 opacity-50" />
              </div>
            </div>

            <div>
              <Label htmlFor="earnedGrade" className="text-sm font-medium">
                취득 성적
              </Label>
              <div className="relative mt-1">
                <select
                  className="border-input bg-background ring-offset-background focus:ring-ring flex h-10 w-full appearance-none items-center justify-between rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  value={getGradeFromScore(editingCourse.earnedGrade)}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      earnedGrade: getScoreFromGrade(e.target.value),
                    })
                  }
                >
                  <option value="미설정">선택하세요</option>
                  <option value="A+">A+ (4.5)</option>
                  <option value="A">A (4.0)</option>
                  <option value="B+">B+ (3.5)</option>
                  <option value="B">B (3.0)</option>
                  <option value="C+">C+ (2.5)</option>
                  <option value="C">C (2.0)</option>
                  <option value="D+">D+ (1.5)</option>
                  <option value="D">D (1.0)</option>
                  <option value="F">F (0.0)</option>
                </select>
                <ChevronDown className="pointer-events-none absolute top-3 right-3 h-4 w-4 opacity-50" />
              </div>
            </div>

            <div>
              <Label htmlFor="completedCredits" className="text-sm font-medium">
                이수 학점
              </Label>
              <Input
                id="completedCredits"
                type="number"
                value={editingCourse.completedCredits ?? ''}
                onChange={(e) =>
                  setEditingCourse({
                    ...editingCourse,
                    completedCredits: Number(e.target.value),
                  })
                }
                placeholder="예: 3"
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="inline-flex cursor-pointer items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Save className="mr-2 h-4 w-4" />
              저장
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 성과 기록 모달 컴포넌트
function AchievementEditModal({
  courseId,
  achievements = [],
  trigger,
}: {
  courseId: string;
  achievements: components['schemas']['CourseAssessmentResponse'][];
  trigger: React.ReactNode;
}) {
  const utils = useQueryClient();
  const [editingAchievements, setEditingAchievements] =
    useState<components['schemas']['CourseAssessmentResponse'][]>(achievements);
  const [newAchievement, setNewAchievement] = useState<
    components['schemas']['CreateCourseAssessmentRequest']
  >({
    title: '',
    maxScore: 0,
    score: 0,
  });
  const [isOpen, setIsOpen] = useState(false);

  const insertMutation = api.useMutation(
    'post',
    '/v1/courses/{courseId}/assessments',
    {
      onSuccess: (data) => {
        utils.setQueryData(
          [
            'get',
            '/v1/courses/{courseId}/assessments',
            { params: { path: { courseId: courseId } } },
          ],
          (oldData: any) => {
            if (!oldData || !oldData.courseAssessments) {
              return { courseAssessments: [data] };
            }
            return {
              courseAssessments: [...oldData.courseAssessments, data],
            };
          },
        );
        setEditingAchievements((prev) => [...prev, data]);
      },
    },
  );

  const updateMutation = api.useMutation(
    'put',
    '/v1/courses/{courseId}/assessments/{id}',
  );

  const deleteMutation = api.useMutation(
    'delete',
    '/v1/courses/{courseId}/assessments/{id}',
  );

  const handleSave = () => {
    if (!editingAchievements || editingAchievements.length === 0) {
      setIsOpen(false);
      return;
    }

    editingAchievements.forEach((achievement) => {
      if (achievement.id) {
        updateMutation.mutate({
          params: {
            path: { courseId: courseId, id: achievement.id },
          },
          body: {
            title: achievement.title || '',
            maxScore: achievement.maxScore,
            score: achievement.score,
          },
        });
      }
    });

    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(
      {
        params: { path: { courseId: courseId, id: id } },
      },
      {
        onSuccess: () => {
          utils.setQueryData(
            [
              'get',
              '/v1/courses/{courseId}/assessments',
              { params: { path: { courseId: courseId } } },
            ],
            (oldData: any) => {
              if (!oldData || !oldData.courseAssessments) {
                return { courseAssessments: [] };
              }

              return {
                courseAssessments: oldData.courseAssessments.filter(
                  (
                    achievement: components['schemas']['CourseAssessmentResponse'],
                  ) => achievement && achievement.id !== id,
                ),
              };
            },
          );

          setEditingAchievements((prev) =>
            prev.filter((achievement) => achievement.id !== id),
          );
        },
      },
    );
  };

  const handleCancel = () => {
    setEditingAchievements(achievements);
    setNewAchievement({ title: '', maxScore: 0, score: 0 });
    setIsOpen(false);
  };

  const handleAddAchievement = () => {
    if (newAchievement.title !== '' && newAchievement.maxScore > 0) {
      insertMutation.mutate({
        params: { path: { courseId: courseId } },
        body: newAchievement,
      });

      setNewAchievement({ title: '', maxScore: 0, score: 0 });
    }
  };

  const handleUpdateAchievement = (
    id: string,
    field: keyof components['schemas']['CourseAssessmentResponse'],
    value: string | number,
  ) => {
    const old = editingAchievements.find(
      (achievement) => achievement.id === id,
    );

    updateMutation.mutate(
      {
        params: {
          path: { courseId: courseId, id: id },
        },
        body: {
          title: old?.title || '',
          maxScore: old?.maxScore || 0,
          score: old?.score || 0,
          [field]: value,
        },
      },
      {
        onSuccess: () => {
          utils.setQueryData(
            [
              'get',
              '/v1/courses/{courseId}/assessments',
              { params: { path: { courseId: courseId } } },
            ],
            (oldData: any) => {
              if (!oldData || !oldData.courseAssessments) {
                return { courseAssessments: [] };
              }
              return oldData.courseAssessments.map(
                (
                  oldAchievement: components['schemas']['CourseAssessmentResponse'],
                ) => {
                  const updatedAchievement = editingAchievements.find(
                    (item) => item.id === id,
                  );

                  return updatedAchievement
                    ? { ...oldAchievement, ...updatedAchievement }
                    : oldAchievement;
                },
              );
            },
          );
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto bg-white sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>성과 기록 수정</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* 기존 성과 목록 */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">
              현재 성과 기록
            </h3>
            {editingAchievements.length > 0 ? (
              <div className="space-y-3">
                {editingAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="grid grid-cols-4 items-end gap-3 rounded-lg border p-3"
                  >
                    <div>
                      <Label className="text-xs text-gray-600">평가 항목</Label>
                      <Input
                        value={achievement.title || ''}
                        onChange={(e) =>
                          setEditingAchievements((prev) =>
                            prev.map((item) =>
                              item.id === achievement.id
                                ? { ...item, title: e.target.value }
                                : item,
                            ),
                          )
                        }
                        onBlur={() => {
                          handleUpdateAchievement(
                            achievement.id,
                            'title',
                            achievement.title || '',
                          );
                        }}
                        placeholder="예: 출석"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">만점</Label>
                      <Input
                        type="number"
                        value={achievement.maxScore || 0}
                        onChange={(e) =>
                          setEditingAchievements((prev) =>
                            prev.map((item) =>
                              item.id === achievement.id
                                ? {
                                    ...item,
                                    maxScore: Number(e.target.value) || 0,
                                  }
                                : item,
                            ),
                          )
                        }
                        onBlur={() => {
                          handleUpdateAchievement(
                            achievement.id,
                            'maxScore',
                            achievement.maxScore || 0,
                          );
                        }}
                        placeholder="100"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">점수</Label>
                      <Input
                        type="number"
                        value={achievement.score || 0}
                        max={achievement.maxScore}
                        min={0}
                        onChange={(e) =>
                          setEditingAchievements((prev) =>
                            prev.map((item) =>
                              item.id === achievement.id
                                ? {
                                    ...item,
                                    score: Math.min(
                                      Number(e.target.value) || 0,
                                      item.maxScore || 0,
                                    ),
                                  }
                                : item,
                            ),
                          )
                        }
                        onBlur={() => {
                          handleUpdateAchievement(
                            achievement.id,
                            'score',
                            achievement.score || 0,
                          );
                        }}
                        placeholder="85"
                        className="mt-1"
                      />
                    </div>
                    <button
                      onClick={() => handleDelete(achievement.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-md border border-red-200 text-red-500 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-gray-500">
                등록된 성과 기록이 없습니다.
              </p>
            )}
          </div>

          {/* 새 성과 추가 */}
          <div className="border-t pt-4">
            <h3 className="mb-3 text-sm font-medium text-gray-900">
              새 성과 추가
            </h3>
            <div className="grid grid-cols-4 items-end gap-3">
              <div>
                <Label className="text-xs text-gray-600">평가 항목</Label>
                <Input
                  value={newAchievement.title || ''}
                  onChange={(e) =>
                    setNewAchievement({
                      ...newAchievement,
                      title: e.target.value,
                    })
                  }
                  placeholder="예: 기말고사"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600">만점</Label>
                <Input
                  type="number"
                  value={newAchievement.maxScore || 0}
                  onChange={(e) =>
                    setNewAchievement({
                      ...newAchievement,
                      maxScore: Number(e.target.value),
                    })
                  }
                  placeholder="100"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600">점수</Label>
                <Input
                  type="number"
                  value={newAchievement.score || 0}
                  onChange={(e) =>
                    setNewAchievement({
                      ...newAchievement,
                      score: Number(e.target.value),
                    })
                  }
                  placeholder="85"
                  className="mt-1"
                />
              </div>
              <button
                onClick={handleAddAchievement}
                disabled={!newAchievement.title.trim()}
                className="flex h-10 cursor-pointer items-center justify-center rounded-md bg-blue-600 text-white disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              onClick={handleCancel}
              className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="inline-flex cursor-pointer items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Save className="mr-2 h-4 w-4" />
              저장
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function GradeManagementCards({
  course,
  achievements,
}: {
  course: components['schemas']['Course'];
  achievements: components['schemas']['CourseAssessmentResponse'][];
}) {
  return (
    <div>
      {/* 학점 관리 카드 */}
      <div
        style={{
          backgroundColor: '#F7F7F7',
          border: '1px solid #e6e6e6',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          position: 'relative',
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1d1b20',
              margin: '0 0 16px 0',
            }}
          >
            학점 관리
          </h3>

          {/* 빨간색 큰 편집 버튼 */}
          <GradeEditModal
            course={course}
            trigger={
              <Button
                variant="destructive"
                className="cursor-pointer rounded-md bg-[#5971E7] px-4 text-white hover:bg-[#4a63d1]"
              >
                ✏️ 편집
              </Button>
            }
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '16px',
            textAlign: 'center',
          }}
        >
          <div>
            <p
              style={{
                margin: '0 0 4px 0',
                fontSize: '14px',
                color: '#757575',
              }}
            >
              목표 성적
            </p>
            <p
              style={{
                margin: '0',
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1d1b20',
              }}
            >
              {getGradeFromScore(course.targetGrade)}
            </p>
          </div>
          <div>
            <p
              style={{
                margin: '0 0 4px 0',
                fontSize: '14px',
                color: '#757575',
              }}
            >
              취득 성적
            </p>
            <p
              style={{
                margin: '0',
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1d1b20',
              }}
            >
              {getGradeFromScore(course.earnedGrade)}
            </p>
          </div>
          <div>
            <p
              style={{
                margin: '0 0 4px 0',
                fontSize: '14px',
                color: '#757575',
              }}
            >
              이수 학점
            </p>
            <p
              style={{
                margin: '0',
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1d1b20',
              }}
            >
              {course.completedCredits ?? '0'}
            </p>
          </div>
        </div>
      </div>

      {/* 성과 기록 카드 */}
      <div
        style={{
          backgroundColor: '#F7F7F7',
          border: '1px solid #e6e6e6',
          borderRadius: '16px',
          padding: '24px',
          position: 'relative',
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1d1b20',
              margin: '0 0 16px 0',
            }}
          >
            성과 기록
          </h3>

          {/* 빨간색 큰 편집 버튼 */}
          <AchievementEditModal
            achievements={achievements}
            courseId={course.id!}
            trigger={
              <Button
                variant="destructive"
                className="cursor-pointer rounded-md bg-[#5971E7] px-4 text-white hover:bg-[#4a63d1]"
              >
                ✏️ 편집
              </Button>
            }
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 진행률 바 */}
          <div
            style={{
              height: '16px',
              width: '100%',
              borderRadius: '8px',
              backgroundColor: '#e6e6e6',
            }}
          >
            <div
              style={{
                height: '100%',
                borderRadius: '8px',
                backgroundColor: '#5971e7',
                transition: 'width 0.3s ease',
                width: `${
                  achievements &&
                  Array.isArray(achievements) &&
                  achievements.length > 0
                    ? Math.min(
                        (achievements.reduce(
                          (sum, item) => sum + (item?.score || 0),
                          0,
                        ) /
                          Math.max(
                            achievements.reduce(
                              (sum, item) => sum + (item?.maxScore || 0),
                              0,
                            ),
                            1, // 0으로 나누는 것을 방지
                          )) *
                          100,
                        100,
                      )
                    : 0
                }%`,
              }}
            ></div>
          </div>

          {achievements &&
          Array.isArray(achievements) &&
          achievements.length > 0 ? (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '16px',
                  textAlign: 'center',
                }}
              >
                <div>
                  <p
                    style={{
                      margin: '0 0 4px 0',
                      fontSize: '14px',
                      color: '#757575',
                    }}
                  >
                    평가 항목
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      margin: '0 0 4px 0',
                      fontSize: '14px',
                      color: '#757575',
                    }}
                  >
                    만점
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      margin: '0 0 4px 0',
                      fontSize: '14px',
                      color: '#757575',
                    }}
                  >
                    점수
                  </p>
                </div>
              </div>

              {(achievements || []).map((achievement) => (
                <div
                  key={achievement.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '16px',
                    textAlign: 'center',
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: '0',
                        fontSize: '14px',
                        color: '#1d1b20',
                      }}
                    >
                      {achievement.title}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        margin: '0',
                        fontSize: '14px',
                        color: '#1d1b20',
                      }}
                    >
                      {achievement.maxScore}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        margin: '0',
                        fontSize: '14px',
                        color: '#1d1b20',
                      }}
                    >
                      {achievement.score}
                    </p>
                  </div>
                </div>
              ))}

              {/* 총점 표시 */}
              <div
                style={{
                  borderTop: '1px solid #e6e6e6',
                  paddingTop: '8px',
                  marginTop: '16px',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '16px',
                    textAlign: 'center',
                    fontWeight: '600',
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: '0',
                        fontSize: '14px',
                        color: '#1d1b20',
                      }}
                    >
                      총점
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        margin: '0',
                        fontSize: '14px',
                        color: '#1d1b20',
                      }}
                    >
                      {(achievements || []).reduce(
                        (sum, item) => sum + (item?.maxScore || 0),
                        0,
                      )}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        margin: '0',
                        fontSize: '14px',
                        color: '#1d1b20',
                      }}
                    >
                      {(achievements || []).reduce(
                        (sum, item) => sum + (item?.score || 0),
                        0,
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                color: '#757575',
                padding: '32px 0',
              }}
            >
              <p style={{ margin: '0 0 8px 0' }}>
                등록된 성과 기록이 없습니다.
              </p>
              <p style={{ margin: '0', fontSize: '14px' }}>
                편집 버튼을 눌러 성과를 추가해보세요.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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

  const {
    data: courseData,
    isLoading: isCourseLoading,
    error: courseError,
  } = api.useQuery('get', '/v1/courses/{id}', {
    params: {
      path: {
        id: courseId,
      },
    },
  });

  const {
    data: assessmentsData,
    isLoading: isAssessmentsLoading,
    error: assessmentsError,
  } = api.useQuery('get', '/v1/courses/{courseId}/assessments', {
    params: {
      path: {
        courseId: courseId,
      },
    },
  });

  const {
    data: feedbackData,
    isLoading: isFeedbackLoading,
    error: feedbackError,
  } = api.useQuery('get', '/v1/courses/{id}/weakness-analysis', {
    params: {
      path: {
        id: courseId,
      },
    },
  });

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

  const course = useMemo(() => {
    if (!courseData || isCourseLoading) return null;
    return courseData;
  }, [courseData, isCourseLoading]);

  const assessments = useMemo(() => {
    if (!assessmentsData || isAssessmentsLoading) return [];
    return assessmentsData || [];
  }, [assessmentsData, isAssessmentsLoading]);

  if (
    !data ||
    isLoading ||
    !data.lectures ||
    isExamLoading ||
    isCourseLoading ||
    isAssessmentsLoading
  ) {
    return <div>Loading...</div>;
  }

  if (error) return `An error occured: ${error}`;

  if (course === null || courseError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center text-lg text-red-600">
          {courseError ? courseError.message : 'Course not found'}
        </div>
      </div>
    );
  }

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
              exams.map((exam, i) => (
                <ExamCard
                  key={`${exam.id}-${i}`}
                  exam={exam}
                  semesterId={semesterId}
                  courseId={courseId}
                />
                // <Card
                //   className="cursor-pointer border-[#e6e6e6] transition-shadow hover:shadow-md"
                //   onClick={() => {
                //     router.push(
                //       `/${semesterId}/${courseId}/exam/solve/${exam.id}`,
                //     );
                //   }}
                // >
                //   <CardContent className="flex flex-col items-center p-6">
                //     <h3 className="mb-4 text-sm font-medium text-[#1d1b20]">
                //       {exam.title}
                //     </h3>
                //     <CircularProgress value={90} total={100} size={80} />
                //     <div className="mt-4 text-center">
                //       <Button className="w-full bg-[#5971e7] text-sm text-white hover:bg-[#4a5fd1]">
                //         상세 결과 보기
                //       </Button>
                //       <p className="mt-2 text-xs text-[#999999]">
                //         {new Date(exam.createdAt!).toLocaleString()}
                //       </p>
                //     </div>
                //   </CardContent>
                // </Card>
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
      </div>

      <div className="w-80 space-y-6 border-[#e6e6e6] bg-white">
        {/* 퀴즈 통계 */}
        {/* <Card className="border-[#e6e6e6] bg-[#F7F7F7]">
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
        </Card> */}

        {/* 여정 분석 및 공부 추천 */}
        <Card className="border-[#e6e6e6] bg-[#F7F7F7]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-[#1d1b20]">
              여정 분석 및 공부 추천
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-[#757575]">
              {/* feedbackData : weaknesses */}
              {feedbackData &&
              (feedbackData.weaknesses ||
                feedbackData.suggestions ||
                feedbackData.analyzed_at) ? (
                <>
                  {feedbackData.weaknesses && (
                    <p>
                      <strong>약점</strong>
                    </p>
                  )}
                  {feedbackData.weaknesses && <p>{feedbackData.weaknesses}</p>}
                  {feedbackData.weaknesses && <br />}
                  {feedbackData.suggestions && (
                    <p>
                      <strong>제안</strong>
                    </p>
                  )}
                  {feedbackData.suggestions && (
                    <p>{feedbackData.suggestions}</p>
                  )}
                  {feedbackData.suggestions && <br />}
                  {feedbackData.analyzed_at && (
                    <p>
                      <strong>분석</strong>
                    </p>
                  )}
                  {feedbackData.analyzed_at && (
                    <p>{feedbackData.analyzed_at}</p>
                  )}
                </>
              ) : (
                <p>아직 분석 데이터가 부족합니다</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 학점 관리 */}
        {/* <Card className="border-[#e6e6e6] bg-[#F7F7F7]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-[#1d1b20]">학점 관리</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="mb-1 text-sm text-[#757575]">목표 성적</p>
                <p className="text-xl font-bold text-[#1d1b20]">
                  {course.targetGrade !== undefined
                    ? course.targetGrade >= 4.5
                      ? 'A+'
                      : course.targetGrade >= 4.0
                        ? 'A'
                        : course.targetGrade >= 3.5
                          ? 'B+'
                          : course.targetGrade >= 3.0
                            ? 'B'
                            : course.targetGrade >= 2.5
                              ? 'C+'
                              : course.targetGrade >= 2.0
                                ? 'C'
                                : course?.targetGrade >= 1.5
                                  ? 'D+'
                                  : course?.targetGrade >= 1.0
                                    ? 'D'
                                    : 'F'
                    : '미설정'}
                </p>
              </div>
              <div>
                <p className="mb-1 text-sm text-[#757575]">취득 성적</p>
                <p className="text-xl font-bold text-[#1d1b20]">
                  {course.earnedGrade
                    ? course.earnedGrade >= 4.5
                      ? 'A+'
                      : course.earnedGrade >= 4.0
                        ? 'A'
                        : course.earnedGrade >= 3.5
                          ? 'B+'
                          : course.earnedGrade >= 3.0
                            ? 'B'
                            : course.earnedGrade >= 2.5
                              ? 'C+'
                              : course.earnedGrade >= 2.0
                                ? 'C'
                                : course.earnedGrade >= 1.5
                                  ? 'D+'
                                  : course.earnedGrade >= 1.0
                                    ? 'D'
                                    : 'F'
                    : '미설정'}
                </p>
              </div>
              <div>
                <p className="mb-1 text-sm text-[#757575]">이수 학점</p>
                <p className="text-xl font-bold text-[#1d1b20]">
                  {course.completedCredits ?? '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* 성과 기록 */}
        {/* <Card className="border-[#e6e6e6] bg-[#F7F7F7]">
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
        </Card> */}
        <GradeManagementCards
          course={course}
          achievements={
            (
              assessments as components['schemas']['CourseAssessmentListResponse']
            )
              .courseAssessments as components['schemas']['CourseAssessmentResponse'][]
          }
        />
      </div>
    </main>
  );
}
