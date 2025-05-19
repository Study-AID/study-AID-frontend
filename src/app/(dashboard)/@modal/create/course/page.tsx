'use client';

import { api } from '@/api/client';
import { DialogTitle } from '@headlessui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import ModalWrapper from '../../_components/ModalWrapper';
import { CourseSchema, courseSchema } from '../[semesterId]/schema';

export default function CourseCreateModal() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const semesterId = searchParams.get('semesterId');

  if (semesterId === null) {
    router.back();
    return;
  }

  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CourseSchema>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      semesterId: semesterId,
    },
  });

  const createSemester = api.useMutation('post', '/v1/courses', {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['get', '/v1/courses/semester/{semesterId}'],
      });
    },
  });

  const onSubmit = (data: CourseSchema) => {
    createSemester.mutate({
      body: data,
    });
    router.back();
  };

  return (
    <ModalWrapper>
      <DialogTitle as="h3" className="text-lg leading-6 font-semibold">
        과목 추가하기
      </DialogTitle>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-4 flex flex-col space-y-4"
      >
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            과목 이름
          </label>
          <input
            id="name"
            {...register('name')}
            className={`mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : ''
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="rounded bg-gray-200 px-4 py-2"
            onClick={() => router.back()}
          >
            취소
          </button>
          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            {createSemester.isPending ? '생성 중...' : '생성'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
