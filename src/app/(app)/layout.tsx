
'use client';

import { AuthContextProvider, useAuth } from '@/components/auth/AuthContext';
import { Header } from '@/components/core/Header';
import { MainSidebar } from '@/components/core/MainSidebar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar'; // Keep for sidebar mechanics
import { AppProvider as MyAppProvider } from '@/contexts/AppContext'; // Import the renamed AppProvider to avoid conflict if any

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

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
  
  return (
    // SidebarProvider from ShadCN UI is for the complex sidebar component's state.
    // MyAppProvider (our AppContext) is for global app state like theme, lang, mode.
    <SidebarProvider defaultOpen={true}> 
      <div className="flex min-h-screen bg-background">
        <MainSidebar />
        {/* SidebarInset is part of the ShadCN UI Sidebar structure */}
        <div className="flex flex-col flex-1 overflow-hidden peer-data-[variant=inset]:ml-[var(--sidebar-width)] md:peer-data-[state=collapsed]:peer-data-[variant=sidebar]:ml-[var(--sidebar-width-icon)] md:peer-data-[state=expanded]:peer-data-[variant=sidebar]:ml-[var(--sidebar-width)]">
          <Header /> 
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
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
    // MyAppProvider wraps AuthContextProvider, or vice-versa depending on needs.
    // Auth state might be needed by AppContext, so AuthContextProvider can be outer.
    // However, AppContext (for translations, theme) is needed by login page too.
    // The root layout already has AppProvider. Here we need Auth.
    <AuthContextProvider>
      {/* MyAppProvider is already in RootLayout, so AuthenticatedLayout will consume it */}
      <AuthenticatedLayout>
        {children}
      </AuthenticatedLayout>
    </AuthContextProvider>
  );
}
