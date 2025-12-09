'use client';

type MainMenuProps = {
  children: React.ReactNode;
};

export default function ProtectedLayoutCard({ children }: MainMenuProps) {
  return (
    <section className='w-full h-[calc(100%-64px)] p-5'>{children}</section>
  );
}
