import { z } from 'zod';

export const loginSchema = z.object({
  account: z.string().email('이메일 형식이 아닙니다.'),
  password: z
    .string()
    .min(8, '아이디 또는 비밀번호가 잘못되었습니다.')
    .max(20, '아이디 또는 비밀번호가 잘못되었습니다.'),
});

export type LoginSchema = z.infer<typeof loginSchema>;
