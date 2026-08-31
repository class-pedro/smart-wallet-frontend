"use client";

import { Menu, LogOut, Search, Bell, HelpCircle, User } from "lucide-react";
import { WalletIcon } from "@/components/login/icons";
import { useSidebar } from "@/components/layout/sidebar-context";

type TopbarProps = {
  onLogout: () => void;
};

export function Topbar({ onLogout }: TopbarProps) {
  const { collapsed, openMobile } = useSidebar();

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-space-md md:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openMobile}
            aria-label="Abrir menu"
            className="-ml-1 text-on-surface-variant transition-colors hover:text-on-surface md:cursor-pointer"
          >
            <Menu className="h-6 w-6" strokeWidth={2} />
          </button>
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
          <LogOut className="h-5 w-5" strokeWidth={2} />
        </button>
      </header>

      <header
        className={`fixed top-0 z-30 hidden h-16 items-center justify-between border-b border-outline-variant bg-surface/80 px-space-lg backdrop-blur-xl transition-[left] duration-200 md:right-0 md:flex ${
          collapsed ? "md:left-sidebar-collapsed-width" : "md:left-sidebar-width"
        }`}
      >
        <div className="flex items-center gap-space-sm rounded-full border border-outline-variant/30 bg-surface-container-low px-space-md py-space-xs">
          <Search className="h-5 w-5 text-on-surface-variant" strokeWidth={2} />
          <input
            disabled
            placeholder="Pesquisar..."
            aria-label="Pesquisar (em breve)"
            className="w-64 border-none bg-transparent text-body-md placeholder:text-on-surface-variant/60 focus:ring-0 disabled:cursor-default"
          />
        </div>
        <div className="flex items-center gap-space-lg">
          <span className="text-on-surface-variant/60">
            <Bell className="h-5 w-5" strokeWidth={2} />
          </span>
          <span className="text-on-surface-variant/60">
            <HelpCircle className="h-5 w-5" strokeWidth={2} />
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <User className="h-4 w-4 text-on-primary" strokeWidth={2} />
          </div>
        </div>
      </header>
    </>
  );
}
