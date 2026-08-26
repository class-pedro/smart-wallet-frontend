"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getWalletId, signOut } from "@/lib/auth";
import { fetchDashboard, type DashboardData } from "@/lib/dashboard";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

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
    <div className="min-h-screen bg-surface">
      <Sidebar activePath="dashboard" onLogout={handleLogout} />
      <Topbar onLogout={handleLogout} />

      <div className="pt-14 md:pl-sidebar-width md:pt-16">
        <main className="flex w-full flex-col gap-space-lg px-space-md py-space-lg md:px-space-lg">
          <div className="flex flex-col gap-space-md sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-headline-lg text-on-surface">Dashboard</h1>
              <p className="text-body-lg text-on-surface-variant">
                Visão geral das suas despesas.
              </p>
            </div>
            <div className="flex gap-space-sm">
              <select
                value={month}
                disabled={state === "loading"}
                onChange={(event) => handleMonthChange(Number(event.target.value))}
                className="rounded-lg border-none bg-surface-container px-space-md py-space-sm text-body-lg text-on-surface outline-none transition-colors focus:ring-0 disabled:opacity-50 md:cursor-pointer"
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
                className="rounded-lg border-none bg-surface-container px-space-md py-space-sm text-body-lg text-on-surface outline-none transition-colors focus:ring-0 disabled:opacity-50 md:cursor-pointer"
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
      <div className="relative overflow-hidden rounded-xl bg-surface-container p-space-md shadow-sm">
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-xl" />
        <span className="relative z-10 block text-label-md uppercase tracking-widest text-on-surface-variant">
          Total de Despesas
        </span>
        <div className="relative z-10 mt-space-sm text-headline-lg text-on-surface">
          {currencyFormatter.format(data.total)}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-surface-container shadow-sm">
        <div className="flex items-center justify-between border-b border-surface-container-high p-space-lg">
          <h2 className="text-title-lg text-on-surface">Despesas do Mês</h2>
          <span className="text-body-md text-on-surface-variant">
            {data.expenses.length} {data.expenses.length === 1 ? "despesa" : "despesas"}
          </span>
        </div>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-surface-container-low">
              <th className="p-space-md text-label-md font-medium uppercase text-on-surface-variant">
                Descrição
              </th>
              <th className="p-space-md text-right text-label-md font-medium uppercase text-on-surface-variant">
                Valor
              </th>
            </tr>
          </thead>
          <tbody>
            {data.expenses.map((expense) => (
              <tr
                key={expense.dashboardExpenseId}
                className="group transition-colors hover:bg-surface-container-high"
              >
                <td className="flex items-center gap-3 p-space-md text-body-md text-on-surface">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-primary shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                  </div>
                  <span className="truncate">{expense.dashboardExpenseDescription}</span>
                </td>
                <td className="p-space-md text-right text-body-md font-medium text-error">
                  -{currencyFormatter.format(expense.dashboardExpenseCost)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-space-lg">
      <div className="rounded-xl bg-surface-container-low p-space-lg shadow-sm">
        <div className="mb-space-lg h-5 w-32 rounded bg-surface-container" />
        <div className="h-8 w-40 rounded-md bg-surface-container-high" />
      </div>
      <div className="rounded-xl bg-surface-container-low p-space-lg shadow-sm">
        <div className="mb-space-lg flex items-center justify-between">
          <div className="h-6 w-40 rounded bg-surface-container" />
          <div className="h-5 w-16 rounded bg-surface-container" />
        </div>
        <div className="flex flex-col gap-space-md">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-space-md">
                <div className="h-10 w-10 rounded-full bg-surface-container" />
                <div className="h-4 w-32 rounded bg-surface-container-high" />
              </div>
              <div className="h-4 w-16 rounded bg-surface-container-high" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ monthLabel, year }: { monthLabel: string; year: number }) {
  return (
    <div className="relative flex min-h-100 flex-col items-center justify-center overflow-hidden rounded-xl bg-surface-container-lowest p-space-xl shadow-sm">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-40">
        <svg
          className="h-105 w-105 text-surface-container"
          viewBox="0 0 100 100"
          fill="none"
          aria-hidden
        >
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
          <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 6" />
          <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>
      <div className="relative z-10 flex max-w-md flex-col items-center text-center">
        <div className="relative mb-space-lg flex h-24 w-24 items-center justify-center rounded-full bg-surface-container-low shadow-md">
          <span
            className="material-symbols-outlined text-[48px] text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            account_balance_wallet
          </span>
          <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-lowest shadow-sm">
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
              search_off
            </span>
          </div>
        </div>
        <h2 className="mb-space-sm text-title-lg text-on-surface">Nenhuma despesa encontrada</h2>
        <p className="text-body-md text-on-surface-variant">
          Não há despesas registradas para {monthLabel} de {year}.
        </p>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="relative flex min-h-100 items-center justify-center overflow-hidden rounded-xl p-space-lg">
      <div className="absolute left-1/4 top-1/4 -z-10 h-80 w-80 rounded-full bg-error-container/30 blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-56 w-56 rounded-full bg-primary-container/10 blur-[80px]" />
      <div className="group relative flex w-full max-w-lg flex-col items-center rounded-4xl border border-outline-variant/10 bg-surface-container/30 p-space-xl text-center shadow-xl backdrop-blur-sm">
        <div className="relative mb-space-lg h-24 w-24">
          <div
            className="absolute inset-0 animate-ping rounded-full bg-error-container opacity-20"
            style={{ animationDuration: "3s" }}
          />
          <div className="absolute inset-0 animate-pulse rounded-full bg-error-container opacity-40" />
          <div className="relative z-10 flex h-full w-full items-center justify-center rounded-full bg-surface shadow-md">
            <span
              className="material-symbols-outlined text-[48px] text-error transition-transform duration-500 ease-out group-hover:scale-110"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              error
            </span>
          </div>
        </div>
        <h2 className="mb-space-sm text-headline-lg tracking-tight text-on-surface">
          Ocorreu um erro ao carregar o dashboard
        </h2>
        <p className="mb-space-xl max-w-sm text-body-lg text-on-surface-variant">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="group flex items-center gap-space-sm rounded-xl bg-secondary-container px-space-xl py-space-md text-title-lg font-medium text-on-secondary-container shadow-sm transition-all duration-200 hover:shadow-md active:scale-95 md:cursor-pointer"
        >
          <span className="material-symbols-outlined transition-transform duration-500 group-hover:-rotate-180">
            refresh
          </span>
          Tentar Novamente
        </button>
      </div>
    </div>
  );
}
