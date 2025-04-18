import Header from './Header';
import SemesterCard from './SemesterCard';
import Sidebar from './sidebar';

const semesterCards = [
  { title: '2024-2', classesCount: 3, isAddCard: false },
  { title: '2024-1', classesCount: 3, isAddCard: false },
  { title: '2025-1', isAddCard: true, addText: '학기 추가하기' },
  { title: '새학기', isAddCard: true, addText: '추가하기' },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />

        <div className="flex flex-wrap gap-4 p-6">{children}</div>
      </div>
    </div>
  );
}
