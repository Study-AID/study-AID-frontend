import { AuthClientProvider, AuthProvider } from '@/providers/authProvider';
import ReactQueryProvider from '@/providers/queryProvider';
import { LectureUploadProvider } from '@/providers/uploadProvider';
import Header from './Header';
import SemesterCard from './SemesterCard';
import Sidebar from './sidebar';

export default async function DashboardLayout({
  modal,
  children,
}: {
  modal: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <LectureUploadProvider>
        {modal}
        <div className="flex h-screen w-full">
          <Sidebar />
          <div className="flex flex-1 flex-col">
            <Header />

            <div className="flex flex-wrap gap-4 p-6">{children}</div>
          </div>
        </div>
      </LectureUploadProvider>
    </AuthProvider>
  );
}
