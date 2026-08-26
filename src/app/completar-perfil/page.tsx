import type { Metadata } from "next";
import { CompleteProfileCard } from "@/components/onboarding/complete-profile-card";
import { WalletIcon } from "@/components/login/icons";

export const metadata: Metadata = {
  title: "Complete seu perfil | Smart Wallet",
  description: "Finalize seu cadastro para começar a usar a Smart Wallet.",
};

export default function CompleteProfilePage() {
  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center gap-8 bg-surface-bright p-4">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <WalletIcon className="h-8 w-8 text-on-primary" />
          </div>
          <h1 className="mt-2 text-[31.25px] font-semibold tracking-tight text-on-surface">
            Smart Wallet
          </h1>
          <p className="text-sm text-on-surface-variant">
            Só mais um passo para começar
          </p>
        </div>

        <CompleteProfileCard />
      </div>
    </main>
  );
}
