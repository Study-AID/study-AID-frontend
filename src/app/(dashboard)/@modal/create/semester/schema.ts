import { z } from 'zod';

export const semesterSchema = z.object({
  name: z.string().min(1, '학기 이름을 입력해주세요.'),
  year: z.coerce.number(),
  season: z.enum(['SPRING', 'SUMMER', 'FALL', 'WINTER'], {
    errorMap: () => ({ message: '학기 시즌을 선택해주세요.' }),
  }),
});

export type SemesterSchema = z.infer<typeof semesterSchema>;
