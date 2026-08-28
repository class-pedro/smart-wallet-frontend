"use client";

import Link from "next/link";

type NavItem = {
  key: string;
  label: string;
  icon: string;
  href?: string;
};

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard", href: "/dashboard" },
  { key: "transacoes", label: "Transações", icon: "receipt_long", href: "/transacoes" },
  { key: "cartoes", label: "Cartões", icon: "credit_card", href: "/cartoes" },
  { key: "contas", label: "Contas", icon: "account_balance" },
  { key: "configuracoes", label: "Configurações", icon: "settings" },
];

type SidebarProps = {
  activePath: string;
  onLogout: () => void;
};

export function Sidebar({ activePath, onLogout }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-full w-sidebar-width flex-col border-r border-outline-variant bg-surface-container-lowest md:flex">
      <div className="flex items-center gap-2 p-space-lg">
        <span className="material-symbols-outlined text-[32px] text-primary">
          account_balance_wallet
        </span>
        <span className="text-headline-md tracking-tight text-on-background">Smart Wallet</span>
      </div>

      <nav className="mt-space-md flex-1 space-y-unit px-space-md">
        {NAV_ITEMS.map((item) =>
          item.href ? (
            <Link
              key={item.key}
              href={item.href}
              aria-current={item.key === activePath ? "page" : undefined}
              className={`flex items-center gap-space-md rounded-lg px-space-md py-space-sm transition-all ${
                item.key === activePath
                  ? "bg-primary-container font-medium text-on-primary-container"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-body-lg">{item.label}</span>
            </Link>
          ) : (
            <span
              key={item.key}
              aria-disabled="true"
              className="flex cursor-default items-center gap-space-md rounded-lg px-space-md py-space-sm text-on-surface-variant/40"
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-body-lg">{item.label}</span>
            </span>
          )
        )}
      </nav>

      <div className="flex items-center justify-between border-t border-outline-variant p-space-lg">
        <div className="flex items-center gap-space-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <span className="material-symbols-outlined text-[18px] text-on-primary">person</span>
          </div>
          <span className="text-body-md font-medium text-on-surface">Minha Conta</span>
        </div>
        <button
          type="button"
          onClick={onLogout}
          aria-label="Sair"
          className="text-on-surface-variant transition-colors hover:text-on-surface md:cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
        </button>
      </div>
    </aside>
  );
}
