"use client";

import { WalletIcon } from "@/components/login/icons";

type TopbarProps = {
  onLogout: () => void;
};

export function Topbar({ onLogout }: TopbarProps) {
  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-space-md md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <WalletIcon className="h-5 w-5 text-on-primary" />
          </div>
          <span className="text-body-lg font-semibold text-on-surface">Smart Wallet</span>
        </div>
        <button
          type="button"
          onClick={onLogout}
          aria-label="Sair"
          className="text-on-surface-variant transition-colors hover:text-on-surface md:cursor-pointer"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
      </header>

      <header className="fixed left-0 top-0 z-40 hidden h-16 items-center justify-between border-b border-outline-variant bg-surface/80 px-space-lg backdrop-blur-xl md:left-sidebar-width md:right-0 md:flex">
        <div className="flex items-center gap-space-sm rounded-full border border-outline-variant/30 bg-surface-container-low px-space-md py-space-xs">
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
            search
          </span>
          <input
            disabled
            placeholder="Pesquisar..."
            aria-label="Pesquisar (em breve)"
            className="w-64 border-none bg-transparent text-body-md placeholder:text-on-surface-variant/60 focus:ring-0 disabled:cursor-default"
          />
        </div>
        <div className="flex items-center gap-space-lg">
          <span className="text-on-surface-variant/60">
            <span className="material-symbols-outlined">notifications</span>
          </span>
          <span className="text-on-surface-variant/60">
            <span className="material-symbols-outlined">help</span>
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <span className="material-symbols-outlined text-[18px] text-on-primary">person</span>
          </div>
        </div>
      </header>
    </>
  );
}
