'use client';

import { type ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import {
  SidebarProvider,
  useSidebar,
} from '@/components/layout/sidebar-context';

type AppShellProps = {
  activePath: string;
  onLogout: () => void;
  children: ReactNode;
};

export function AppShell(props: AppShellProps) {
  return (
    <SidebarProvider>
      <AppShellContent {...props} />
    </SidebarProvider>
  );
}

function AppShellContent({ activePath, onLogout, children }: AppShellProps) {
  const { collapsed } = useSidebar();

  return (
    <div className='min-h-screen bg-base-200'>
      <Sidebar activePath={activePath} onLogout={onLogout} />
      <Topbar onLogout={onLogout} />

      <div
        className={`pt-0 transition-[padding-left] duration-200 md:pt-16 ${
          collapsed ? 'md:pl-sidebar-collapsed-width' : 'md:pl-sidebar-width'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
