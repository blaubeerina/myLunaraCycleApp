'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import type { AppMode } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  CalendarDays, 
  BookHeart, 
  BellRing, 
  Settings,
  Moon, 
  Baby
} from 'lucide-react';
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'; // Assuming this is the complex sidebar from shadcn-custom

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
  { href: '/calendar', labelKey: 'calendar', icon: CalendarDays },
  { href: '/journal', labelKey: 'journal', icon: BookHeart },
  { href: '/reminders', labelKey: 'reminders', icon: BellRing },
  { href: '/settings', labelKey: 'settings', icon: Settings },
];

export function MainSidebar() {
  const { userPreferences, setUserPreferences, t } = useAppContext();
  const pathname = usePathname();

  const setAppMode = (mode: AppMode) => {
    setUserPreferences((prev) => ({ ...prev, appMode: mode }));
  };

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="border-r shadow-sm"
    >
      <SidebarHeader className="p-4">
        {/* SidebarTrigger is typically outside or part of Header for mobile */}
        {/* Logo can be here for collapsed state or a smaller version */}
      </SidebarHeader>
      <SidebarContent className="flex flex-col p-2">
        <SidebarMenu className="flex-grow">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname === item.href || (item.href === '/dashboard' && pathname.startsWith('/dashboard'))}
                  tooltip={{ children: t(item.labelKey), side: 'right', align: 'center' }}
                  className="justify-start"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="truncate group-data-[collapsible=icon]:hidden">{t(item.labelKey)}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        
        <Separator className="my-4" />

        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden px-2">{t('appMode')}</SidebarGroupLabel>
            <SidebarMenuItem>
                <SidebarMenuButton
                    onClick={() => setAppMode('cycle')}
                    isActive={userPreferences.appMode === 'cycle'}
                    tooltip={{children: t('cycleMode'), side: 'right', align: 'center'}}
                    className="justify-start"
                >
                    <Moon className="h-5 w-5" />
                    <span className="truncate group-data-[collapsible=icon]:hidden">{t('cycleMode')}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                 <SidebarMenuButton
                    onClick={() => setAppMode('pregnancy')}
                    isActive={userPreferences.appMode === 'pregnancy'}
                    tooltip={{children: t('pregnancyMode'), side: 'right', align: 'center'}}
                    className="justify-start"
                >
                    <Baby className="h-5 w-5" />
                    <span className="truncate group-data-[collapsible=icon]:hidden">{t('pregnancyMode')}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        {/* Footer content like version or help link */}
      </SidebarFooter>
    </Sidebar>
  );
}


// Helper component for mode toggle if not using SidebarMenuButton directly for actions
const ModeToggleButton: React.FC<{
  mode: AppMode;
  currentMode: AppMode;
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  isCollapsed?: boolean;
}> = ({ mode, currentMode, label, icon: Icon, onClick, isCollapsed }) => (
  <Button
    variant={currentMode === mode ? 'secondary' : 'ghost'}
    className={cn(
      "w-full justify-start gap-2",
      isCollapsed ? "px-2" : "px-3"
    )}
    onClick={onClick}
    aria-pressed={currentMode === mode}
  >
    <Icon className="h-5 w-5" />
    {!isCollapsed && <span>{label}</span>}
    {isCollapsed && <span className="sr-only">{label}</span>}
  </Button>
);
