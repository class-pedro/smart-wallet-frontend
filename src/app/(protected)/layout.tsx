import { AuthGuard } from '@/lib/authGuard';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      {' '}
      <header className='bg-green-300 w-full h-10 flex  justify-center items-center'>
        <p className='text-gray-700 font-medium'>Logado</p>
      </header>
      <AuthGuard>{children}</AuthGuard>
    </main>
  );
}
