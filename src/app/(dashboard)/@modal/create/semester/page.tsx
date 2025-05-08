'use client';

import { api } from '@/api/client';
import { DialogTitle } from '@headlessui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import ModalWrapper from '../../_components/ModalWrapper';
import { SemesterSchema, semesterSchema } from './schema';

export default function SemesterCreateModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const semesterName = searchParams.get('name') || '';
  const semesterYear = searchParams.get('year') || '2025';
  const semesterSeason = searchParams.get('season') || '';
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SemesterSchema>({
    resolver: zodResolver(semesterSchema),
    defaultValues: searchParams
      ? {
          name: semesterName,
          year: Number(semesterYear),
          season: semesterSeason as any,
        }
      : undefined,
  });

  const createSemester = api.useMutation('post', '/v1/semesters', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get', '/v1/semesters'] });
    },
  });

  const onSubmit = (data: SemesterSchema) => {
    createSemester.mutate({
      body: data,
    });
    router.back();
  };

  return (
    <ModalWrapper>
      <DialogTitle as="h3" className="text-lg leading-6 font-semibold">
        학기 추가하기
      </DialogTitle>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-4 flex flex-col space-y-4"
      >
        {/* 학기 이름 */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            학기 이름
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

        {/* 연도 & 시즌 */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="year" className="block text-sm font-medium">
              연도
            </label>
            <input
              id="year"
              type="number"
              {...register('year')}
              className={`mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
                errors.year ? 'border-red-500' : ''
              }`}
            />
            {errors.year && (
              <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>
            )}
          </div>
          <div className="flex-1">
            <label htmlFor="season" className="block text-sm font-medium">
              시즌
            </label>
            <select
              id="season"
              {...register('season')}
              className={`mt-1 block w-full appearance-none rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
                errors.season ? 'border-red-500' : ''
              }`}
            >
              <option value="">선택하세요</option>
              <option value="SPRING">봄</option>
              <option value="SUMMER">여름</option>
              <option value="FALL">가을</option>
              <option value="WINTER">겨울</option>
            </select>
            {errors.season && (
              <p className="mt-1 text-sm text-red-600">
                {errors.season.message}
              </p>
            )}
          </div>
        </div>

        {/* 버튼 그룹 */}
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
