'use client';

import { api } from '@/api/client';
import { Card, CardContent } from '@/component/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/component/ui/dialog';
import { Input } from '@/component/ui/input';
import { Label } from '@/component/ui/label';
import { useLectureUpload } from '@/providers/uploadProvider';
import { components } from '@/types/openapi.schema';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  CirclePlus,
  Edit2,
  FileText,
  LayoutGrid,
  List,
  Menu,
  MessageCircle,
  Plus,
  Save,
  Search,
  Upload,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';

function EditLectureModal({
  isOpen,
  onClose,
  lectureId,
  currentTitle,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  lectureId: string;
  currentTitle: string;
  onSave: (lectureId: string, newTitle: string) => void;
}) {
  const [title, setTitle] = useState(currentTitle);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(currentTitle);
    }
  }, [isOpen, currentTitle]);

  const handleSave = async () => {
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      await onSave(lectureId, title.trim());
      onClose();
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTitle(currentTitle);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>강의 제목 수정</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="lecture-title" className="text-sm font-medium">
              강의 제목
            </Label>
            <Input
              id="lecture-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="강의 제목을 입력하세요"
              className="mt-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                } else if (e.key === 'Escape') {
                  handleCancel();
                }
              }}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isSaving}
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LectureAccordion({
  lecture,
  subtitle,
  link,
  onEditTitle,
}: {
  lecture: components['schemas']['LectureResponse'];
  subtitle?: string;
  link: string;
  onEditTitle: (lectureId: string, currentTitle: string) => void;
}) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  return (
    <section
      className="my-3 h-16 cursor-pointer rounded-lg bg-white shadow"
      onClick={() => {
        router.push(link);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <header className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-x-3">
          <List className="my-auto size-6" />
          <div className="text-left">
            <h3 className="text-base font-medium text-gray-800">
              {lecture.title}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditTitle(lecture.id, lecture.title);
                }}
                className={`cursor-pointer p-1 text-gray-400 transition-opacity delay-200 hover:text-gray-600 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <Edit2 size={14} />
              </button>
            </h3>
            {subtitle && (
              <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
        <nav className="flex items-center gap-x-6 text-gray-600">
          <Menu
            className="cursor-pointer hover:text-gray-800"
            size={16}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`${link}/menu`);
            }}
          />
          <FileText
            className="cursor-pointer hover:text-gray-800"
            size={16}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`${link}/file`);
            }}
          />
          <LayoutGrid
            className="cursor-pointer hover:text-gray-800"
            size={16}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`${link}/grid`);
            }}
          />
          <MessageCircle
            className="cursor-pointer hover:text-gray-800"
            size={16}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`${link}/message`);
            }}
          />
        </nav>
      </header>
    </section>
  );
}

function NewLectureAccordion({ onClick }: { onClick: () => void }) {
  return (
    <Card
      className="cursor-pointer border-2 border-dashed border-[#d1d5db] bg-[#f8f9fa]"
      onClick={onClick}
    >
      <CardContent className="p-8 text-center">
        <Upload className="mx-auto mb-2 h-8 w-8 text-[#757575]" />
        <p className="mb-2 text-[#757575]">
          업로드할 강의 자료 파일을 선택하거나 드래그 앤 드롭을 하세요.
        </p>
        <p className="text-sm text-[#999999]">지원되는 파일 형식: PDF</p>
      </CardContent>
    </Card>
    // <div
    //   onClick={onClick}
    //   className="flex h-16 cursor-pointer items-center justify-center rounded-lg border-2 border-[#D7D7D7] bg-black opacity-65 transition hover:opacity-85"
    // >
    //   <CirclePlus className="size-8 cursor-pointer text-[#F3F3F3]" />
    // </div>
  );
}

export function LectureList({
  courseId,
  semesterId,
  lectures,
  search,
  setSearch,
}: {
  courseId: string;
  semesterId: string;
  lectures: components['schemas']['LectureResponse'][];
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
}) {
  const router = useRouter();
  const { setFile, file } = useLectureUpload();
  const utils = useQueryClient();

  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    lectureId: string;
    currentTitle: string;
  }>({
    isOpen: false,
    lectureId: '',
    currentTitle: '',
  });

  const updateLecture = api.useMutation('put', '/v1/lectures/{id}');

  const handleFileDrop = useCallback(
    (item: { files: any[] }) => {
      if (item) {
        const files = item.files;
        setFile(files[0]);
      }
    },
    [setFile],
  );

  const handleOpen = () => router.push(`/create/lecture?courseId=${courseId}`);

  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      accept: [NativeTypes.FILE],
      drop(item: { files: any[] }) {
        if (handleFileDrop) {
          handleFileDrop(item);
        }
      },
      canDrop(item: any) {
        return true;
      },
      hover(item: any) {},
      collect: (monitor: DropTargetMonitor) => {
        const item = monitor.getItem() as any;

        return {
          isOver: monitor.isOver(),
          canDrop: monitor.canDrop(),
        };
      },
    }),
    [handleFileDrop],
  );

  useEffect(() => {
    if (file) {
      console.log('file', file);
      router.push(`/create/lecture?courseId=${courseId}`);
    }
  }, [file, router, courseId]);

  const updateOrder = api.useMutation(
    'put',
    '/v1/lectures/{id}/display-order-lex',
    {
      onSuccess: () => {
        // 필요시 invalidateQueries
      },
    },
  );

  const isActive = canDrop && isOver;

  const startEditLecture = (lectureId: string, currentTitle: string) => {
    setEditModal({
      isOpen: true,
      lectureId,
      currentTitle,
    });
  };

  const closeEditModal = () => {
    setEditModal({
      isOpen: false,
      lectureId: '',
      currentTitle: '',
    });
  };

  const onSaveLecture = (lectureId: string, newTitle: string) => {
    if (newTitle === editModal.currentTitle) {
      closeEditModal();
      return;
    }
    // if title is empty, do not update
    if (!newTitle.trim()) {
      return;
    }
    updateLecture.mutate(
      {
        params: { path: { id: lectureId } },
        body: { title: newTitle },
      },
      {
        onSuccess: (data) => {
          utils.setQueryData(
            [
              'get',
              '/v1/lectures/course/{courseId}',
              {
                params: {
                  path: {
                    courseId: courseId,
                  },
                },
              },
            ],
            (oldData: components['schemas']['LectureListResponse']) => {
              if (!oldData || !oldData.lectures) {
                return oldData;
              }

              const newData = {
                lectures: oldData.lectures.map((l) => {
                  if (l.id === lectureId) {
                    return {
                      ...l,
                      title: newTitle,
                    };
                  }
                  return l;
                }) as components['schemas']['LectureResponse'][],
              };

              console.log('Updated lectures:', newData);

              return newData;
            },
          );
          closeEditModal();
        },
        onError: (error) => {},
      },
    );
  };

  return (
    <div className="relative" ref={drop}>
      <section className="rounded-lg bg-[#F7F7F7] shadow">
        <header className="flex items-center justify-between px-6 py-2">
          <h2 className="font-medium">강의 목록</h2>

          <div className="flex items-center gap-x-3">
            <div className="flex items-center space-x-2 rounded-xl border border-[#D7D7D7] bg-[#FBFBFB] pr-3 pl-2">
              <input
                type="text"
                defaultValue={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent py-1 text-sm text-black focus:outline-none"
              />
              <Search size={20} className="cursor-pointer text-[#B8B8B8]" />
            </div>
            <Plus
              className="cursor-pointer text-gray-600 hover:text-gray-800"
              onClick={handleOpen}
            />
          </div>
        </header>
        {/* 강의 자료 검색 */}

        <div className="scroll-th relative max-h-[50dvh] overflow-y-scroll rounded-b-lg px-3 pb-4 text-center text-gray-500">
          <LectureListInner
            lectures={lectures}
            semesterId={semesterId}
            onEditTitle={startEditLecture}
          />

          <NewLectureAccordion onClick={handleOpen} />

          {isActive && (
            <div className="absolute inset-0 z-10 flex h-full w-full items-center justify-center rounded-lg bg-gray-200 opacity-75">
              <p className="text-gray-800">파일을 놓으세요</p>
            </div>
          )}
        </div>
      </section>

      <EditLectureModal
        isOpen={editModal.isOpen}
        onClose={closeEditModal}
        lectureId={editModal.lectureId}
        currentTitle={editModal.currentTitle}
        onSave={onSaveLecture}
      />
    </div>
  );
}

function LectureListInner({
  lectures,
  semesterId,
  onEditTitle,
}: {
  lectures: components['schemas']['LectureResponse'][];
  semesterId: string;
  onEditTitle: (lectureId: string, currentTitle: string) => void;
}) {
  return (
    <div className="">
      {lectures.map((lecture) => (
        <LectureAccordion
          key={lecture.id}
          lecture={lecture}
          subtitle={format(lecture.updatedAt, '마지막 학습 시간: yyyy.MM.dd')}
          onEditTitle={onEditTitle}
          link={`/${semesterId}/${lecture.courseId}/${lecture.id}?tab=note`}
        />
      ))}
    </div>
  );
}
