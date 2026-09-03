'use client';

import { Menu, LogOut, Bell, HelpCircle, User } from 'lucide-react';
import { WalletIcon } from '@/components/login/icons';
import { useSidebar } from '@/components/layout/sidebar-context';

type TopbarProps = {
  onLogout: () => void;
};

export function Topbar({ onLogout }: TopbarProps) {
  const { collapsed, openMobile } = useSidebar();

  return (
    <>
      <div className='navbar sticky top-0 z-50 h-14 border-b border-base-300 bg-base-100 px-space-md md:hidden'>
        <div className='navbar-start gap-2'>
          <button
            type='button'
            onClick={openMobile}
            aria-label='Abrir menu'
            className='btn btn-ghost btn-square btn-sm -ml-2'
          >
            <Menu className='h-6 w-6' strokeWidth={2} />
          </button>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-content'>
            <WalletIcon className='h-5 w-5' />
          </div>
          <span className='text-body-lg font-semibold text-base-content'>
            Smart Wallet
          </span>
        </div>
        <div className='navbar-end'>
          <button
            type='button'
            onClick={onLogout}
            aria-label='Sair'
            className='btn btn-ghost btn-square btn-sm'
          >
            <LogOut className='h-5 w-5' strokeWidth={2} />
          </button>
        </div>
      </div>

      <div
        className={`navbar fixed top-0 z-30 hidden h-16 w-auto border-b border-base-300 bg-base-100/80 px-space-lg backdrop-blur-xl transition-[left] duration-200 md:right-0 md:flex ${
          collapsed
            ? 'md:left-sidebar-collapsed-width'
            : 'md:left-sidebar-width'
        }`}
      >
        <div className='navbar-start'>
          {/* <label className='input input-bordered flex w-64 items-center gap-space-sm rounded-full bg-base-200'>
            <Search className='h-5 w-5 text-base-content/50' strokeWidth={2} />
            <input
              disabled
              placeholder='Pesquisar...'
              aria-label='Pesquisar (em breve)'
              className='grow bg-transparent text-body-md placeholder:text-base-content/40 disabled:cursor-default'
            />
          </label> */}
        </div>
        <div className='navbar-end gap-space-lg'>
          <span className='text-base-content/40'>
            <Bell className='h-5 w-5' strokeWidth={2} />
          </span>
          <span className='text-base-content/40'>
            <HelpCircle className='h-5 w-5' strokeWidth={2} />
          </span>
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-content'>
            <User className='h-4 w-4' strokeWidth={2} />
          </div>
        </div>
      </div>
    </>
  );
}
