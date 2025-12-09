import { MainMenu } from '@/components/MainMenu';
import ProtectedLayoutCard from '@/components/ProtectedLayoutCard';
import { AuthGuard } from '@/lib/authGuard';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <AuthGuard>
        <MainMenu>
          <ProtectedLayoutCard>{children}</ProtectedLayoutCard>
        </MainMenu>
      </AuthGuard>
    </main>
  );
}
