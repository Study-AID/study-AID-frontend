import { z } from 'zod';

export const quizCreateSchema = z.object({
  lectureId: z.string().uuid(),
  title: z.string().min(1, '제목을 입력해주세요.'),
  trueOrFalseCount: z.coerce.number().default(0),
  multipleChoiceCount: z.coerce.number().default(0),
  shortAnswerCount: z.coerce.number().default(0),
  essayCount: z.coerce.number().default(0),
});

export type QuizCreateFormValues = z.infer<typeof quizCreateSchema>;
