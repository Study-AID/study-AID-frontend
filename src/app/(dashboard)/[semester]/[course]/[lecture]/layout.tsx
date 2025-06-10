import clsx from 'clsx';
import Link from 'next/link';
import { pdfjs } from 'react-pdf';
import TabItems from './tabItems';

export default async function LectureLayout({
  params,
  children,
}: {
  params: Promise<{
    semester: string;
    course: string;
    lecture: string;
  }>;
  children: React.ReactNode;
}) {
  const { semester, course, lecture } = await params;

  return (
    <div className="flex h-full flex-col gap-y-2">
      <TabItems semester={semester} course={course} lecture={lecture} />
      <div className="max-h-[calc(100dvh-8rem)] pb-4">{children}</div>
    </div>
  );
}
