'use client';

import { menuOptions } from '@/constants/menu';
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PanelTopOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

type MainMenuProps = {
  children: React.ReactNode;
};

export function MainMenu({ children }: MainMenuProps) {
  const { push } = useRouter();
  const { logout } = useAuth();

  function getPageTitleByPath() {
    let pathName: string | string[] = usePathname();
    pathName = pathName.split('/');
    pathName = pathName[pathName.length - 1];
    pathName =
      pathName.charAt(0).toUpperCase() + pathName.slice(1).toLocaleLowerCase();
    return pathName;
  }

  return (
    <div className='drawer lg:drawer-open'>
      <input id='my-drawer-4' type='checkbox' className='drawer-toggle' />
      <div className='drawer-content'>
        {/* Navbar */}
        <nav className='navbar bg-base-200 w-full max-h-16 flex items-center justify-between px-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]'>
          <div className='w-fit flex items-center gap-2'>
            <label
              htmlFor='my-drawer-4'
              aria-label='open sidebar'
              className='p-2 rounded cursor-pointer lg:hidden hover:opacity-70'
            >
              <PanelTopOpen className='rotate-270' />
            </label>
            <h1 className='font-semibold'>{`${getPageTitleByPath()}`}</h1>
          </div>
          <button
            className='bg-red-400 text-white font-medium p-2 w-full max-w-16 rounded cursor-pointer hover:opacity-80'
            onClick={logout}
          >
            Sair
          </button>
        </nav>
        {children}
      </div>

      <div className='drawer-side shadow-[8px_0_16px_-4px_rgba(0,0,0,0.12)] is-drawer-close:overflow-visible'>
        <div className='bg-base-200 flex min-h-full flex-col items-start is-drawer-close:w-14 is-drawer-open:w-64'>
          {/* Sidebar content here */}
          <ul className='menu w-full content-center p-0 gap-1'>
            <div className='w-full h-16 flex justify-between items-center py-4 is-drawer-close:justify-center is-drawer-open:px-2 border-b border-gray-500'>
              <div className='flex items-center gap-2 is-drawer-close:hidden'>
                <div className='avatar'>
                  <div className='w-8 rounded'>
                    <img src='https://img.daisyui.com/images/profile/demo/batperson@192.webp' />
                  </div>
                </div>
                <span className='font-bold'>Pedro Ribeiro</span>
              </div>
              <label
                htmlFor='my-drawer-4'
                aria-label='open sidebar'
                className='w-full p-2 flex justify-center items-center rounded cursor-pointer hover:opacity-70 is-drawer-open:w-10'
              >
                {/* Sidebar toggle icon */}
                <PanelTopOpen className='rotate-270 transition-transform duration-500 is-drawer-open:scale-y-[-1]' />
              </label>
            </div>
            {menuOptions.map(({ icon: Icon, title, path }, index) => (
              <li key={index}>
                <button
                  className='is-drawer-close:tooltip is-drawer-close:tooltip-right'
                  data-tip={title}
                  onClick={() => push(path)}
                >
                  {/* Home icon */}
                  <Icon className='is-drawer-close:mx-auto' size={24} />
                  <span className='is-drawer-close:hidden'>{title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
