'use client';

import Link from 'next/link';
import { LogoIcon } from '@/components/icons/LogoIcon';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthContext';
import { LogOut, UserCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


interface HeaderProps {
  onToggleSidebar?: () => void; // For mobile sidebar toggle
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { t } = useAppContext();
  const { user, logout, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          {onToggleSidebar && (
             <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="md:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          )}
          <Link href="/dashboard" className="flex items-center gap-2">
            <LogoIcon className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-foreground">{t('appName')}</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {user && !isLoading ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://placehold.co/100x100.png?text=${user.displayName?.[0] || 'U'}`} alt={user.displayName || "User"} data-ai-hint="avatar person" />
                    <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => alert('Profile page not implemented.')}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="outline">{t('login')}</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
