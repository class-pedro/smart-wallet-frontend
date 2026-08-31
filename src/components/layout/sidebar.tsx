"use client";

import Link from "next/link";
import {
  Wallet,
  LayoutDashboard,
  Receipt,
  CreditCard,
  Landmark,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { useSidebar } from "@/components/layout/sidebar-context";

type NavItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  href?: string;
};

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { key: "transacoes", label: "Transações", icon: Receipt, href: "/transacoes" },
  { key: "cartoes", label: "Cartões", icon: CreditCard, href: "/cartoes" },
  { key: "contas", label: "Contas", icon: Landmark },
  { key: "configuracoes", label: "Configurações", icon: Settings },
];

type SidebarProps = {
  activePath: string;
  onLogout: () => void;
};

export function Sidebar({ activePath, onLogout }: SidebarProps) {
  const { collapsed, toggleCollapsed, mobileOpen, closeMobile } = useSidebar();

  return (
    <>
      <div
        aria-hidden={!mobileOpen}
        onClick={closeMobile}
        className={`fixed inset-0 z-40 bg-inverse-surface/40 backdrop-blur-sm transition-opacity md:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-sidebar-width flex-col border-r border-outline-variant bg-surface-container-lowest transition-transform duration-200 md:translate-x-0 md:transition-[width] md:duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "md:w-sidebar-collapsed-width" : "md:w-sidebar-width"}`}
      >
        <div
          className={`flex items-center justify-between gap-1 overflow-hidden p-space-lg ${
            collapsed ? "md:justify-center" : ""
          }`}
        >
          <div
            className={`flex min-w-0 items-center gap-2 overflow-hidden ${collapsed ? "md:hidden" : ""}`}
          >
            <Wallet className="h-6 w-6 shrink-0 text-primary" strokeWidth={2} />
            <span className="truncate text-title-lg font-semibold tracking-tight text-on-background">
              Smart Wallet
            </span>
          </div>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            className="hidden shrink-0 items-center justify-center rounded-lg p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface md:flex md:cursor-pointer"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-5 w-5" strokeWidth={2} />
            ) : (
              <PanelLeftClose className="h-5 w-5" strokeWidth={2} />
            )}
          </button>
        </div>

        <nav className="mt-space-md flex-1 space-y-unit px-space-md">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return item.href ? (
              <Link
                key={item.key}
                href={item.href}
                onClick={closeMobile}
                aria-current={item.key === activePath ? "page" : undefined}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-space-md overflow-hidden rounded-lg px-space-md py-space-sm transition-all ${
                  collapsed ? "md:justify-center" : ""
                } ${
                  item.key === activePath
                    ? "bg-primary-container font-medium text-on-primary-container"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
                <span className={`whitespace-nowrap text-body-lg ${collapsed ? "md:hidden" : ""}`}>
                  {item.label}
                </span>
              </Link>
            ) : (
              <span
                key={item.key}
                aria-disabled="true"
                title={collapsed ? item.label : undefined}
                className={`flex cursor-default items-center gap-space-md overflow-hidden rounded-lg px-space-md py-space-sm text-on-surface-variant/40 ${
                  collapsed ? "md:justify-center" : ""
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
                <span className={`whitespace-nowrap text-body-lg ${collapsed ? "md:hidden" : ""}`}>
                  {item.label}
                </span>
              </span>
            );
          })}
        </nav>

        <div
          className={`flex items-center justify-between gap-space-sm overflow-hidden border-t border-outline-variant p-space-lg ${
            collapsed ? "md:flex-col md:gap-space-md" : ""
          }`}
        >
          <div className="flex items-center gap-space-sm overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
              <User className="h-4 w-4 text-on-primary" strokeWidth={2} />
            </div>
            <span
              className={`whitespace-nowrap text-body-md font-medium text-on-surface ${
                collapsed ? "md:hidden" : ""
              }`}
            >
              Minha Conta
            </span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            aria-label="Sair"
            title={collapsed ? "Sair" : undefined}
            className="shrink-0 text-on-surface-variant transition-colors hover:text-on-surface md:cursor-pointer"
          >
            <LogOut className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      </aside>
    </>
  );
}
