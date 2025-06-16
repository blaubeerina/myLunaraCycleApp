
import type { Metadata } from 'next';
import { Geist } from 'next/font/google'; // Using Geist as it's in the original project
import './globals.css';
import { CycleProvider } from '@/contexts/CycleContext';
import { Toaster } from "@/components/ui/toaster"; // Keep toaster for potential future use

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Lunar Cycle Tracker',
  description: 'A minimalistic menstrual cycle tracker integrating lunar phases.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <CycleProvider>
          {children}
          <Toaster />
        </CycleProvider>
      </body>
    </html>
  );
}
