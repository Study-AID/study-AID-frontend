'use client';

import { api } from '@/api/client';
import {
  LectureUploadProvider,
  useLectureUpload,
} from '@/providers/uploadProvider';
import { components } from '@/types/openapi.schema';
import { DialogTitle } from '@headlessui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent } from 'react';
import { Controller, useForm } from 'react-hook-form';
import ModalWrapper from '../../_components/ModalWrapper';
import { lectureSchema, LectureSchema } from './schema';

export default function LectureCreateModal() {
  const searchParams = useSearchParams();

  const courseId = searchParams.get('courseId');

  if (courseId === null) {
    return null;
  }

  return (
    <LectureUploadProvider courseId={courseId}>
      <LectureCreateModalContent />
    </LectureUploadProvider>
  );
}

function LectureCreateModalContent() {
  const router = useRouter();
  const { courseId, file, setFile, clear } = useLectureUpload();

  if (courseId === null) {
    return null;
  }

  const queryClient = useQueryClient();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LectureSchema>({
    resolver: zodResolver(lectureSchema),
    defaultValues: {
      courseId: courseId,
      file: file ?? undefined,
    },
  });

  const createLecture = api.useMutation('post', '/v1/lectures', {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['get', '/v1/lectures/course/{courseId}'],
      });
    },
  });

  const onSubmit = (data: LectureSchema) => {
    const formData = new FormData();

    formData.append('courseId', data.courseId);
    formData.append('title', data.title);
    formData.append('file', data.file as File);

    createLecture.mutate({
      body: formData as unknown as components['schemas']['CreateLectureRequest'],
    });
    router.back();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setValue('file', selected as any, { shouldValidate: true });
  };

  const handleDrop = (e: React.DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    setFile(dropped);
    setValue('file', dropped as any, { shouldValidate: true });
  };

  return (
    <ModalWrapper>
      <DialogTitle as="h3" className="text-lg leading-6 font-semibold">
        과목 추가하기
      </DialogTitle>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md rounded-lg bg-white p-6"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop as React.DragEventHandler<HTMLFormElement>}
      >
        <h2 className="mb-4 text-xl font-bold">새 강의 추가</h2>
        <input type="hidden" {...register('courseId')} />
        <div className="mb-4">
          <input
            type="text"
            placeholder="강의 제목"
            {...register('title')}
            className="w-full rounded border px-3 py-2"
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>
        <div className="relative mb-4 rounded border border-dashed border-gray-300 p-6 text-center">
          {file ? (
            <div className="mb-2 text-gray-700">{file.name}</div>
          ) : (
            <p className="text-gray-500">
              파일을 드래그하거나 클릭하여 선택하세요.
            </p>
          )}
          <Controller
            name="file"
            control={control}
            render={({ field }) => (
              <input
                type="file"
                accept="*"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                onChange={(e) => {
                  const selected = e.target.files?.[0] ?? null;
                  setFile(selected);
                  field.onChange(selected);
                }}
              />
            )}
          />
          {/* <input
            type="file"
            accept="*"
            {...register('file')}
            onChange={handleFileChange}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          /> */}
          {errors.file && (
            <p className="text-sm text-red-500">{errors.file.message}</p>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => {
              clear();
              router.back();
            }}
            className="rounded border px-4 py-2"
          >
            취소
          </button>
          <button
            type="submit"
            className="rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
            disabled={createLecture.isPending}
          >
            {createLecture.isPending ? '업로드 중...' : '저장'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
