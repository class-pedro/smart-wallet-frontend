export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen flex items-center justify-center bg-muted'>
      <header className='bg-blue-300 w-full h-10 flex  justify-center items-center'>
        <p className='text-gray-700 font-medium'>Deslogado</p>
      </header>
      {children}
    </div>
  );
}
