import type { Metadata } from "next";
import { LoginCard } from "@/components/login/login-card";
import { WalletIcon } from "@/components/login/icons";

export const metadata: Metadata = {
  title: "Entrar | Smart Wallet",
  description: "Acesse sua conta Smart Wallet com segurança.",
};

export default function LoginPage() {
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
            Acesso seguro à sua gestão financeira
          </p>
        </div>

        <LoginCard />
      </div>

      <div className="flex items-center gap-4 text-[10.24px] font-medium text-on-surface-variant">
        <a className="transition-colors hover:text-primary" href="#">
          Política de Segurança
        </a>
        <span className="h-1 w-1 rounded-full bg-outline-variant" />
        <a className="transition-colors hover:text-primary" href="#">
          Status do Sistema
        </a>
      </div>
    </main>
  );
}
