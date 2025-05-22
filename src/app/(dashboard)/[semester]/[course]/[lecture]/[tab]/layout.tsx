import clsx from 'clsx';
import Link from 'next/link';

const tabs = [
  {
    label: '강의 노트',
    prefix: 'note',
  },
  {
    label: '강의 퀴즈',
    prefix: 'quiz',
  },
  {
    label: 'QnA 기록',
    prefix: 'qna',
  },
];

export default async function LectureLayout({
  params,
  children,
}: {
  params: Promise<{
    semester: string;
    course: string;
    lecture: string;
    tab: string;
  }>;
  children: React.ReactNode;
}) {
  const { semester, course, lecture, tab } = await params;

  return (
    <div className="flex flex-col">
      <div className="flex h-full flex-col overflow-hidden">
        <div>
          {tabs.map((tabItem) => (
            <Link
              key={tabItem.prefix}
              href={`/${semester}/${course}/${lecture}/${tabItem.prefix}`}
              replace
              className="cursor-pointer"
            >
              <button
                className={clsx(
                  'mx-1 rounded-md border px-5 py-2 font-medium first:mr-1 first:ml-0 last:mr-0 last:ml-1',
                  tabItem.prefix === tab
                    ? 'border-[#5971E7] bg-[#5971E7] text-white'
                    : 'border-[#C2C2C2] bg-[#F4F4F4] text-[#494949]',
                )}
              >
                {tabItem.label}
              </button>
            </Link>
          ))}
        </div>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
