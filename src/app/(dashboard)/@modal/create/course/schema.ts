import { z } from 'zod';

export const courseSchema = z.object({
  semesterId: z.string().uuid(),
  name: z.string().min(1, { message: '이름을 입력하세요.' }),
});

export type CourseSchema = z.infer<typeof courseSchema>;
