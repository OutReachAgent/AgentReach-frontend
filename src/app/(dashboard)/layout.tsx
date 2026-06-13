import Sidebar from '@/components/Sidebar';
import Alert from '@/components/Alert';
import AuthGuard from '@/components/AuthGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
        <Sidebar />
        <main className="flex-1 overflow-y-auto px-8 py-8 w-full">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
        <Alert />
      </div>
    </AuthGuard>
  );
}
