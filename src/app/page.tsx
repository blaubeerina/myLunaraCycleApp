
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext'; // Assuming AuthContext is used for auth state
import { Loader2 } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace('/dashboard'); // User is logged in, redirect to dashboard
      } else {
        router.replace('/login'); // User is not logged in, redirect to login
      }
    }
  }, [user, isLoading, router]);

  // Display a loading indicator while checking auth state
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background text-foreground">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg text-muted-foreground">Loading your space...</p>
    </div>
  );
}
