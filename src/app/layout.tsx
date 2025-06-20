
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using Inter as a clean sans-serif font
import './globals.css';
import { AppProvider } from '@/contexts/AppContext'; // Updated to AppProvider
import { AuthContextProvider } from '@/components/auth/AuthContext'; // Import AuthContextProvider from components
import { Toaster } from "@/components/ui/toaster"; 
import PaymentNotice from '@/components/core/PaymentNotice'; // Import the new PaymentNotice component

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
          <AuthContextProvider> {/* Ensure this is from the same file as useAuth's context */}
            {children}
          </AuthContextProvider>
          <Toaster />
          <PaymentNotice /> {/* Add the PaymentNotice component here */}
        </AppProvider>
      </body>
    </html>
  );
}
