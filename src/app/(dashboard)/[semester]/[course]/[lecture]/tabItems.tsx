'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
    label: 'QnA 좋아요 기록',
    prefix: 'qnaHistory',
  },
  {
    label: '노트 메모',
    prefix: 'memo',
  },
];

export default function TabItems({
  semester,
  course,
  lecture,
}: {
  semester: string;
  course: string;
  lecture: string;
}) {
  const path = usePathname() || '';

  return (
    <div className="flex h-12 flex-col overflow-hidden">
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
                path.includes(tabItem.prefix)
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
  );
}
