
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
  Baby, // Lucide icon for pregnancy
  Info // Icon for the new About page
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
  { href: '/about', labelKey: 'aboutApp', icon: Info }, // New menu item
];

export function MainSidebar() {
  const { userPreferences, setUserPreferences, t } = useAppContext();
  const pathname = usePathname();

  const setAppMode = (mode: AppMode) => {
    setUserPreferences((prev) => ({ ...prev, appMode: mode }));
  };

  return (
    <Sidebar
      variant="sidebar" // Default sidebar style
      collapsible="icon" // Collapsible to icon mode on desktop
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
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname === item.href || (item.href === '/dashboard' && pathname.startsWith('/dashboard')) || (item.href === '/about' && pathname.startsWith('/about'))}
                  tooltip={{ children: t(item.labelKey), side: 'right', align: 'center' }}
                  className="justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="truncate group-data-[collapsible=icon]:hidden">{t(item.labelKey)}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        
        <Separator className="my-4 bg-sidebar-border" />

        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden px-2 text-sidebar-foreground/70">{t('appMode')}</SidebarGroupLabel>
            <SidebarMenuItem>
                <SidebarMenuButton
                    onClick={() => setAppMode('cycle')}
                    isActive={userPreferences.appMode === 'cycle'}
                    tooltip={{children: t('cycleMode'), side: 'right', align: 'center'}}
                    className="justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
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
                    className="justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
                >
                    <Baby className="h-5 w-5" />
                    <span className="truncate group-data-[collapsible=icon]:hidden">{t('pregnancyMode')}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {/* Footer content like version or help link can go here */}
        <p className="text-xs text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden text-center">
          v{process.env.npm_package_version || '0.1.0'}
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
