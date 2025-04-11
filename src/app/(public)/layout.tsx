import { cn } from '@/lib/utils';
import React from 'react';

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={cn('antialiased')}
    >
      {children}
    </div>
  );
}
