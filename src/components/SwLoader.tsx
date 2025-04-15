import React from 'react';

interface ISwLoader {
  variant?: 'default' | 'ghost';
}
export function SwLoader({ variant = 'default' }: ISwLoader) {
  const loaderColor =
    variant === 'default' ? 'border-swBlue500' : 'border-gray-400';

  return (
    <div className='flex items-center justify-center'>
      <div
        className={`w-12 h-12 border-6 ${loaderColor} border-t-transparent rounded-full animate-spin`}
      ></div>
    </div>
  );
}
