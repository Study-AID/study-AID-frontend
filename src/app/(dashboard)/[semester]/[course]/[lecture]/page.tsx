'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LectureIndex() {
  const router = useRouter();
  const { semester, course, lecture } = useParams() as {
    semester: string;
    course: string;
    lecture: string;
  };

  useEffect(() => {
    router.replace(`/${semester}/${course}/${lecture}/note`);
  }, [router, semester, course, lecture]);

  return null;
}
