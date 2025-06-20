
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import type { AppMode } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, 
  CalendarDays, 
  BookHeart, 
  BellRing, 
  Settings,
  Moon, 
  Baby, 
  Info 
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar'; 
import { LogoIcon } from '@/components/icons/LogoIcon';
import React, { useMemo, useCallback } from 'react'; // Import useMemo and useCallback

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
  { href: '/about', labelKey: 'aboutApp', icon: Info },
];

// New sub-component to handle memoization of tooltipConfig
const SidebarNavMenuItem = ({ 
  item, 
  pathname, 
  t 
}: { 
  item: NavItem, 
  pathname: string, 
  t: (key: string, params?: Record<string, string | number>) => string 
}) => {
  const tooltipConfig = useMemo(() => ({
    children: t(item.labelKey),
    side: 'right' as const,
    align: 'center' as const,
  }), [t, item.labelKey]);

  // Determine isActive based on current logic
  let isActive = pathname === item.href;
  if (item.href === '/dashboard' && pathname.startsWith('/dashboard')) {
    isActive = true;
  }
  if (item.href === '/about' && pathname.startsWith('/about')) {
    isActive = true;
  }
  // Add more specific conditions if needed, for example, for /journal ensuring it doesn't incorrectly match /journal/entry
  if (item.href !== '/' && pathname.startsWith(item.href) && pathname !== item.href) {
    // For nested routes, ensure base path is not active if a sub-path is active unless it's the intended behavior.
    // This specific logic might need adjustment based on exact routing needs for "active" state.
    // For now, the existing logic is maintained within the `isActive` calculation for the button.
  }


  return (
    <SidebarMenuItem>
      <Link href={item.href} passHref legacyBehavior>
        <SidebarMenuButton
          isActive={isActive}
          tooltip={tooltipConfig}
          className="justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
        >
          <item.icon className="h-5 w-5" />
          <span className="truncate group-data-[collapsible=icon]:hidden">{t(item.labelKey)}</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
};


export function MainSidebar() {
  const { userPreferences, setUserPreferences, t } = useAppContext();
  const pathname = usePathname();

  const setAppMode = useCallback((mode: AppMode) => {
    setUserPreferences((prev) => ({ ...prev, appMode: mode }));
  }, [setUserPreferences]);


  const cycleModeTooltip = useMemo(() => ({
    children: t('cycleMode'),
    side: 'right' as const,
    align: 'center' as const,
  }), [t]);

  const pregnancyModeTooltip = useMemo(() => ({
    children: t('pregnancyMode'),
    side: 'right' as const,
    align: 'center' as const,
  }), [t]);

  const handleSetAppModeCycle = useCallback(() => {
    setAppMode('cycle');
  }, [setAppMode]);

  const handleSetAppModePregnancy = useCallback(() => {
    setAppMode('pregnancy');
  }, [setAppMode]);


  return (
    <Sidebar
      variant="sidebar" 
      collapsible="icon" 
      className="border-r shadow-sm bg-sidebar text-sidebar-foreground"
    >
      <SidebarHeader className="p-3 h-16 flex items-center justify-center group-data-[collapsible=icon]:justify-center">
         <Link href="/dashboard" className="flex items-center gap-2">
            <LogoIcon className="h-7 w-7 text-sidebar-primary transition-all duration-300 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8" />
            <span className="text-xl font-bold text-sidebar-foreground transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:hidden">
              {t('appName')}
            </span>
          </Link>
      </SidebarHeader>
      <SidebarContent className="flex flex-col p-2">
        <SidebarMenu className="flex-grow">
          {navItems.map((item) => (
            <SidebarNavMenuItem 
              key={item.href} 
              item={item} 
              pathname={pathname} 
              t={t} 
            />
          ))}
        </SidebarMenu>
        
        <Separator className="my-4 bg-sidebar-border" />

        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden px-2 text-sidebar-foreground/70">{t('appMode')}</SidebarGroupLabel>
            <SidebarMenuItem>
                <SidebarMenuButton
                    onClick={handleSetAppModeCycle}
                    isActive={userPreferences.appMode === 'cycle'}
                    tooltip={cycleModeTooltip}
                    className="justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
                >
                    <Moon className="h-5 w-5" />
                    <span className="truncate group-data-[collapsible=icon]:hidden">{t('cycleMode')}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                 <SidebarMenuButton
                    onClick={handleSetAppModePregnancy}
                    isActive={userPreferences.appMode === 'pregnancy'}
                    tooltip={pregnancyModeTooltip}
                    className="justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
                >
                    <Baby className="h-5 w-5" />
                    <span className="truncate group-data-[collapsible=icon]:hidden">{t('pregnancyMode')}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden text-center">
          v{process.env.npm_package_version || '0.1.0'}
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
