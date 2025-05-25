import { AuthContextProvider } from '@/components/auth/AuthContext';
import { LogoIcon } from '@/components/icons/LogoIcon';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthContextProvider>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
        <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
          <LogoIcon className="h-8 w-8" />
          <span className="text-xl font-semibold">myLunaraCycle</span>
        </Link>
        <main className="w-full max-w-md">
          {children}
        </main>
      </div>
    </AuthContextProvider>
  );
}
