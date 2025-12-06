'use client';

import { menuOptions } from '@/constants/menu';
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft, PanelTopOpen } from 'lucide-react';

type MainMenuProps = {
  children: React.ReactNode;
};

export function MainMenu({ children }: MainMenuProps) {
  const { push } = useRouter();

  function getPageTitleByPath() {
    let pathName: string | string[] = usePathname();
    pathName = pathName.split('/');
    pathName = pathName[pathName.length - 1];
    pathName =
      pathName.charAt(0).toUpperCase() + pathName.slice(1).toLocaleLowerCase();
    return pathName;
  }

  return (
    <div className='bg-primary drawer lg:drawer-open'>
      <input id='my-drawer-4' type='checkbox' className='drawer-toggle' />
      <div className='drawer-content'>
        {/* Navbar */}
        <nav className='navbar w-full'>
          <label
            htmlFor='my-drawer-4'
            aria-label='open sidebar'
            className='btn btn-square btn-ghost lg:hidden'
          >
            <PanelTopOpen className='rotate-270' />
          </label>
          <div className='px-4'>{`${getPageTitleByPath()}`}</div>
        </nav>
        {children}
      </div>

      <div className='drawer-side is-drawer-close:overflow-visible'>
        <div className='flex min-h-full flex-col items-start is-drawer-close:w-14 is-drawer-open:w-64'>
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
                className='w-full p-2 flex justify-center items-center rounded cursor-pointer hover:bg-[#ecf9ff17] is-drawer-open:w-10'
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
