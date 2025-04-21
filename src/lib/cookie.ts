import { cookies } from 'next/headers';

export async function setCookie(name: string, value: string, days: number) {
  const cookie = await cookies();
}
