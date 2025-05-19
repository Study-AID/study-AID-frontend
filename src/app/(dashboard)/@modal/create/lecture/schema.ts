import { z } from 'zod';

export const lectureSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().min(1, { message: '이름을 입력하세요.' }),
  file: z.custom<File>((value) => value instanceof File, {
    message: '파일을 선택해주세요.',
  }),
});

export type LectureSchema = z.infer<typeof lectureSchema>;
