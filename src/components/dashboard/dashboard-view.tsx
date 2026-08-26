"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getWalletId, signOut } from "@/lib/auth";
import { fetchDashboard, type DashboardData } from "@/lib/dashboard";
import { WalletIcon } from "@/components/login/icons";

type ViewState = "loading" | "success" | "empty" | "error";

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const GENERIC_ERROR_MESSAGE =
  "Não foi possível carregar o dashboard. Por favor, tente novamente.";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function yearOptions(currentYear: number): number[] {
  return Array.from({ length: 6 }, (_, i) => currentYear - i);
}

export function DashboardView() {
  const router = useRouter();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [state, setState] = useState<ViewState>("loading");
  const [data, setData] = useState<DashboardData | null>(null);
  const [errorMessage, setErrorMessage] = useState(GENERIC_ERROR_MESSAGE);

  // State updates happen inside the .then/.catch callbacks — i.e. once the
  // fetch's result comes back — never synchronously in `load` itself. The
  // "loading" transition is set by whichever user interaction (select change,
  // retry click) triggered the refetch, not by this effect.
  const load = useCallback(() => {
    const walletId = getWalletId();
    if (!walletId) {
      signOut();
      router.replace("/login");
      return;
    }

    fetchDashboard({ walletId, month, year })
      .then((result) => {
        setData(result);
        setState(result.expenses.length === 0 ? "empty" : "success");
      })
      .catch((error) => {
        setErrorMessage(error instanceof Error ? error.message : GENERIC_ERROR_MESSAGE);
        setState("error");
      });
  }, [month, year, router]);

  useEffect(() => {
    load();
  }, [load]);

  function handleMonthChange(value: number) {
    setMonth(value);
    setState("loading");
  }

  function handleYearChange(value: number) {
    setYear(value);
    setState("loading");
  }

  function handleRetry() {
    setState("loading");
    load();
  }

  function handleLogout() {
    signOut();
    router.replace("/login");
  }

  return (
    <div className="flex min-h-screen bg-surface-bright">
      <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col border-r border-outline-variant bg-surface-container-lowest md:flex">
        <div className="flex items-center gap-2 p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <WalletIcon className="h-6 w-6 text-on-primary" />
          </div>
          <span className="text-[20px] font-semibold tracking-tight text-on-surface">
            Smart Wallet
          </span>
        </div>
        <nav className="mt-2 flex-1 px-4">
          <span className="flex items-center gap-3 rounded-lg bg-primary-container px-4 py-2.5 font-medium text-on-primary-container">
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </span>
        </nav>
        <div className="border-t border-outline-variant p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface md:cursor-pointer"
          >
            <span className="material-symbols-outlined">logout</span>
            Sair
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <WalletIcon className="h-5 w-5 text-on-primary" />
          </div>
          <span className="text-base font-semibold text-on-surface">Smart Wallet</span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Sair"
          className="text-on-surface-variant transition-colors hover:text-on-surface md:cursor-pointer"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
      </header>

      <div className="flex w-full flex-col md:pl-64">
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-[31.25px] font-semibold tracking-tight text-on-surface">
                Dashboard
              </h1>
              <p className="text-sm text-on-surface-variant">
                Visão geral das suas despesas.
              </p>
            </div>
            <div className="flex gap-2">
              <select
                value={month}
                disabled={state === "loading"}
                onChange={(event) => handleMonthChange(Number(event.target.value))}
                className="h-10 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-sm text-on-surface outline-none transition-colors focus:border-primary disabled:opacity-50 md:cursor-pointer"
              >
                {MONTH_NAMES.map((name, index) => (
                  <option key={name} value={index + 1}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                value={year}
                disabled={state === "loading"}
                onChange={(event) => handleYearChange(Number(event.target.value))}
                className="h-10 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-sm text-on-surface outline-none transition-colors focus:border-primary disabled:opacity-50 md:cursor-pointer"
              >
                {yearOptions(now.getFullYear()).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {state === "loading" && <LoadingSkeleton />}
          {state === "error" && <ErrorState message={errorMessage} onRetry={handleRetry} />}
          {state === "empty" && (
            <EmptyState monthLabel={MONTH_NAMES[month - 1]} year={year} />
          )}
          {state === "success" && data && <DashboardContent data={data} />}
        </main>
      </div>
    </div>
  );
}

function DashboardContent({ data }: { data: DashboardData }) {
  return (
    <>
      <div className="relative overflow-hidden rounded-xl bg-surface-container p-6 shadow-sm">
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-xl" />
        <span className="relative z-10 text-[10.24px] font-medium uppercase tracking-widest text-on-surface-variant">
          Total de Despesas
        </span>
        <div className="relative z-10 mt-2 text-[31.25px] font-semibold text-on-surface">
          {currencyFormatter.format(data.total)}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-surface-container shadow-sm">
        <div className="flex items-center justify-between border-b border-surface-container-high p-6">
          <h2 className="text-xl font-medium text-on-surface">Despesas do Mês</h2>
          <span className="text-sm text-on-surface-variant">
            {data.expenses.length} {data.expenses.length === 1 ? "despesa" : "despesas"}
          </span>
        </div>
        <ul className="divide-y divide-surface-container-high">
          {data.expenses.map((expense) => (
            <li
              key={expense.dashboardExpenseId}
              className="flex items-center justify-between gap-4 p-4 sm:p-6"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-primary shadow-sm">
                  <span className="material-symbols-outlined">receipt_long</span>
                </div>
                <span className="truncate text-sm text-on-surface">
                  {expense.dashboardExpenseDescription}
                </span>
              </div>
              <span className="shrink-0 text-sm font-medium text-error">
                -{currencyFormatter.format(expense.dashboardExpenseCost)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6">
      <div className="h-28 rounded-xl bg-surface-container" />
      <div className="h-64 rounded-xl bg-surface-container" />
    </div>
  );
}

function EmptyState({ monthLabel, year }: { monthLabel: string; year: number }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl bg-surface-container-lowest p-10 text-center shadow-sm">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-container-low shadow-md">
        <span className="material-symbols-outlined text-[40px] text-primary">
          account_balance_wallet
        </span>
      </div>
      <h2 className="text-xl font-medium text-on-surface">Nenhuma despesa encontrada</h2>
      <p className="max-w-sm text-sm text-on-surface-variant">
        Não há despesas registradas para {monthLabel} de {year}.
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl bg-surface-container/40 p-10 text-center shadow-sm">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-error-container">
        <span className="material-symbols-outlined text-[40px] text-error">error</span>
      </div>
      <h2 className="text-xl font-medium text-on-surface">
        Ocorreu um erro ao carregar o dashboard
      </h2>
      <p className="max-w-sm text-sm text-on-surface-variant">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="flex items-center gap-2 rounded-lg bg-secondary-container px-6 py-2.5 font-medium text-on-secondary-container transition-colors hover:bg-secondary-container/80 md:cursor-pointer"
      >
        <span className="material-symbols-outlined text-[18px]">refresh</span>
        Tentar novamente
      </button>
    </div>
  );
}
