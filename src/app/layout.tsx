
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; 
import './globals.css';
import { AppProvider } from '@/contexts/AppContext'; 
import { AuthContextProvider } from '@/components/auth/AuthContext'; 
import { Toaster } from "@/components/ui/toaster"; 
import { DemoModeNotice } from '@/components/core/DemoModeNotice'; // Import DemoModeNotice

const inter = Inter({
  variable: '--font-inter', 
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'myLunaraCycle', 
  description: 'Sync with your inner rhythm and the moon.', 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <AppProvider> 
          <AuthContextProvider> 
            <DemoModeNotice /> {/* Add DemoModeNotice here */}
            {children}
          </AuthContextProvider>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
