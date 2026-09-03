'use client';

import Link from 'next/link';
import {
  Wallet,
  LayoutDashboard,
  Receipt,
  CreditCard,
  Landmark,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { useSidebar } from '@/components/layout/sidebar-context';

type NavItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  href?: string;
};

const NAV_ITEMS: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    key: 'transacoes',
    label: 'Transações',
    icon: Receipt,
    href: '/transacoes',
  },
  { key: 'cartoes', label: 'Cartões', icon: CreditCard, href: '/cartoes' },
  { key: 'contas', label: 'Contas', icon: Landmark },
  { key: 'configuracoes', label: 'Configurações', icon: Settings },
];

type SidebarProps = {
  activePath: string;
  onLogout: () => void;
};

export function Sidebar({ activePath, onLogout }: SidebarProps) {
  const { collapsed, toggleCollapsed, mobileOpen, closeMobile } = useSidebar();

  return (
    <>
      <div
        aria-hidden={!mobileOpen}
        onClick={closeMobile}
        className={`fixed inset-x-0 top-14 bottom-0 z-40 bg-neutral/40 backdrop-blur-sm transition-opacity md:hidden ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        className={`fixed left-0 top-14 z-50 flex h-[calc(100%-3.5rem)] w-sidebar-width flex-col border-r border-base-300 bg-base-100 transition-transform duration-200 md:top-0 md:h-full md:translate-x-0 md:transition-[width] md:duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'md:w-sidebar-collapsed-width' : 'md:w-sidebar-width'}`}
      >
        <div
          className={`flex items-center justify-between gap-1 overflow-hidden p-space-lg ${
            collapsed ? 'md:justify-center' : ''
          }`}
        >
          <div
            className={`flex min-w-0 items-center gap-2 overflow-hidden ${collapsed ? 'md:hidden' : ''}`}
          >
            <Wallet className='h-6 w-6 shrink-0 text-primary' strokeWidth={2} />
            <span className='truncate text-title-lg font-semibold tracking-tight text-base-content'>
              Smart Wallet
            </span>
          </div>
          <button
            type='button'
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            className='btn btn-ghost btn-square btn-sm hidden shrink-0 md:flex'
          >
            {collapsed ? (
              <PanelLeftOpen className='h-5 w-5' strokeWidth={2} />
            ) : (
              <PanelLeftClose className='h-5 w-5' strokeWidth={2} />
            )}
          </button>
        </div>

        <ul
          className={`menu w-full mt-space-md flex-1 flex-nowrap gap-1 px-space-sm ${collapsed ? 'md:menu-md md:items-center' : ''}`}
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === activePath;
            return (
              <li key={item.key} className={collapsed ? 'md:w-fit' : ''}>
                {item.href ? (
                  <Link
                    href={item.href}
                    onClick={closeMobile}
                    aria-current={isActive ? 'page' : undefined}
                    title={collapsed ? item.label : undefined}
                    className={`${
                      isActive
                        ? 'bg-primary/10 font-medium text-primary hover:bg-primary/10'
                        : 'text-base-content/70'
                    } ${collapsed ? 'md:justify-center' : ''}`}
                  >
                    <Icon className='h-5 w-5 shrink-0' strokeWidth={2} />
                    <span
                      className={`whitespace-nowrap text-body-lg ${collapsed ? 'md:hidden' : ''}`}
                    >
                      {item.label}
                    </span>
                  </Link>
                ) : (
                  <span
                    aria-disabled='true'
                    title={collapsed ? item.label : undefined}
                    className={`pointer-events-none opacity-40 ${collapsed ? 'md:justify-center' : ''}`}
                  >
                    <Icon className='h-5 w-5 shrink-0' strokeWidth={2} />
                    <span
                      className={`whitespace-nowrap text-body-lg ${collapsed ? 'md:hidden' : ''}`}
                    >
                      {item.label}
                    </span>
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        <div
          className={`flex items-center justify-between gap-space-sm overflow-hidden border-t border-base-300 p-space-lg ${
            collapsed ? 'md:flex-col md:gap-space-md' : ''
          }`}
        >
          <div className='flex items-center gap-space-sm overflow-hidden'>
            <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-content'>
              <User className='h-4 w-4' strokeWidth={2} />
            </div>
            <span
              className={`whitespace-nowrap text-body-md font-medium text-base-content ${
                collapsed ? 'md:hidden' : ''
              }`}
            >
              Minha Conta
            </span>
          </div>
          <button
            type='button'
            onClick={onLogout}
            aria-label='Sair'
            title={collapsed ? 'Sair' : undefined}
            className='btn btn-ghost btn-square btn-sm shrink-0'
          >
            <LogOut className='h-5 w-5' strokeWidth={2} />
          </button>
        </div>
      </aside>
    </>
  );
}
