
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using Inter as a clean sans-serif font
import './globals.css';
import { AppProvider } from '@/contexts/AppContext'; // Updated to AppProvider
import { AuthContextProvider } from '@/components/auth/AuthContext'; // Import AuthContextProvider
import { Toaster } from "@/components/ui/toaster"; 

const inter = Inter({
  variable: '--font-inter', // CSS variable for the font
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'myLunaraCycle', // Updated App Name
  description: 'Sync with your inner rhythm and the moon.', // Updated Description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <AppProvider> {/* Use AppProvider */}
          <AuthContextProvider> {/* Wrap children with AuthContextProvider */}
            {children}
          </AuthContextProvider>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
