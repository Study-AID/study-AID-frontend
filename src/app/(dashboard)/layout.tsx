import { AuthProvider } from '@/providers/authProvider';
import { ThemeProvider } from '@/providers/theme-provider';
import { LectureUploadProvider } from '@/providers/uploadProvider';
import Header from './Header';
import LayoutLoading from './layoutLoading';
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
        <ThemeProvider attribute="class" defaultTheme="light">
          {/* if query isPending is true, show loading spinner */}
          <LayoutLoading />

          {modal}
          <div className="flex min-h-screen bg-[#f9fafb]">
            <div className="flex flex-col">
              <Sidebar />
            </div>
            <div className="flex flex-1 flex-col">
              <Header />

              <div className="grow bg-white p-2">{children}</div>
            </div>
          </div>
        </ThemeProvider>
      </LectureUploadProvider>
    </AuthProvider>
  );
}
