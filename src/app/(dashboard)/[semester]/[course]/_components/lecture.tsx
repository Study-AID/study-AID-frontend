'use client';

import { api } from '@/api/client';
import { Card, CardContent } from '@/component/ui/card';
import { useLectureUpload } from '@/providers/uploadProvider';
import { components } from '@/types/openapi.schema';
import { format } from 'date-fns';
import {
  CirclePlus,
  FileText,
  LayoutGrid,
  List,
  Menu,
  MessageCircle,
  Plus,
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

function LectureAccordion({
  title,
  subtitle,
  link,
  moveLecture,
  onDragEnd,
}: {
  title: string;
  subtitle?: string;
  link: string;
  moveLecture: (from: number, to: number) => void;
  onDragEnd: () => void;
}) {
  const router = useRouter();
  return (
    <section
      className="my-3 h-16 cursor-pointer rounded-lg bg-white shadow"
      onClick={() => {
        router.push(link);
      }}
    >
      <header className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-x-3">
          <List className="my-auto size-6" />
          <div className="text-left">
            <h3 className="text-base font-medium text-gray-800">{title}</h3>
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
        <p className="text-sm text-[#999999]">
          지원되는 파일 형식: PDF, PPTX, TXT, Markdown, MP3
        </p>
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
  initialLectures,
  search,
  setSearch,
}: {
  courseId: string;
  semesterId: string;
  initialLectures: components['schemas']['LectureResponse'][];
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
}) {
  const router = useRouter();
  const { setFile, file } = useLectureUpload();

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

  const [lectures, setLectures] = useState(initialLectures);
  useEffect(() => {
    setLectures(initialLectures);
  }, [initialLectures]);

  const moveLecture = useCallback((from: number, to: number) => {
    setLectures((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return arr;
    });
  }, []);

  const updateOrder = api.useMutation(
    'put',
    '/v1/lectures/{id}/display-order-lex',
    {
      onSuccess: () => {
        // 필요시 invalidateQueries
      },
    },
  );
  const onDragEnd = useCallback(() => {
    const orderedIds = lectures.map((l) => l.id);
    // updateOrder.mutate({

    //   body: {
    //     displayOrderLex:
    //   }
    // });
  }, [lectures, courseId, updateOrder]);

  const isActive = canDrop && isOver;

  return (
    <div ref={drop}>
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
            moveLecture={moveLecture}
            onDragEnd={onDragEnd}
          />

          <NewLectureAccordion onClick={handleOpen} />

          {isActive && (
            <div className="absolute inset-0 z-10 flex h-full w-full items-center justify-center rounded-lg bg-gray-200 opacity-75">
              <p className="text-gray-800">파일을 놓으세요</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function LectureListInner({
  lectures,
  semesterId,
  moveLecture,
  onDragEnd,
}: {
  lectures: components['schemas']['LectureResponse'][];
  semesterId: string;
  moveLecture: (from: number, to: number) => void;
  onDragEnd: () => void;
}) {
  return (
    <div className="">
      {lectures.map((lecture) => (
        <LectureAccordion
          key={lecture.id}
          title={lecture.title}
          subtitle={format(lecture.updatedAt, '마지막 학습 시간: yyyy.MM.dd')}
          moveLecture={moveLecture}
          onDragEnd={onDragEnd}
          link={`/${semesterId}/${lecture.courseId}/${lecture.id}?tab=note`}
        />
      ))}
    </div>
  );
}
