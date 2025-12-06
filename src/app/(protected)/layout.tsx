import { MainMenu } from '@/components/MainMenu';
import { AuthGuard } from '@/lib/authGuard';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <AuthGuard>
        <MainMenu>{children}</MainMenu>
      </AuthGuard>
    </main>
  );
}
