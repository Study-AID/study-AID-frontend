import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z.string().email('이메일 형식이 아닙니다.'),
    password: z
      .string()
      .min(8, '최소 8자 이상이어야 합니다.')
      .max(20, '최대 20자 이하이어야 합니다.'),
    name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다.'),
    confirmPassword: z
      .string()
      .min(8, '최소 8자 이상이어야 합니다.')
      .max(20, '최대 20자 이하이어야 합니다.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
