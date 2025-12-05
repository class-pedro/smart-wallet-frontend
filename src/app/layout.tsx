import type { Metadata } from 'next';
import './globals.css';
import { Manrope } from 'next/font/google';

import { AuthProvider } from '@/contexts/AuthContext';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: 'Smart Wallet',
  description: 'Aplicação para controle de finanças',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className={`${manrope.variable}`}>
      <body className='antialiased'>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
