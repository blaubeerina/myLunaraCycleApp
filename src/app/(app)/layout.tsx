'use client';

import { AuthContextProvider, useAuth } from '@/components/auth/AuthContext';
import { Header } from '@/components/core/Header';
import { MainSidebar } from '@/components/core/MainSidebar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(prev => !prev);


  return (
    <SidebarProvider defaultOpen={true}> {/* Manages sidebar state */}
      <div className="flex min-h-screen bg-background">
        <MainSidebar />
        <SidebarInset className="flex flex-col flex-1 overflow-hidden"> {/* This is your main content area that will resize */}
          <Header onToggleSidebar={toggleMobileSidebar} /> {/* Pass toggle for mobile */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthContextProvider>
      <AuthenticatedLayout>
        {children}
      </AuthenticatedLayout>
    </AuthContextProvider>
  );
}
