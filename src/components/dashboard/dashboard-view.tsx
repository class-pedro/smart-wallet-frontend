'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getWalletId, signOut, SessionExpiredError } from '@/lib/auth';
import { fetchDashboard, type DashboardData } from '@/lib/dashboard';
import { AppShell } from '@/components/layout/app-shell';
import { NewExpenseModal } from '@/components/transactions/new-expense-modal';
import { PrimaryButton } from '@/components/ui/primary-button';

type ViewState = 'loading' | 'success' | 'empty' | 'error';

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const GENERIC_ERROR_MESSAGE =
  'Não foi possível buscar as informações financeiras. Por favor, verifique sua conexão e tente novamente.';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function yearOptions(currentYear: number, selectedYear: number): number[] {
  const top = Math.max(currentYear, selectedYear);
  return Array.from({ length: top - currentYear + 6 }, (_, i) => top - i);
}

export function DashboardView() {
  const router = useRouter();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [state, setState] = useState<ViewState>('loading');
  const [data, setData] = useState<DashboardData | null>(null);
  const [errorMessage, setErrorMessage] = useState(GENERIC_ERROR_MESSAGE);
  const [modalOpen, setModalOpen] = useState(false);
  const walletId = getWalletId();

  // State updates happen inside the .then/.catch callbacks — i.e. once the
  // fetch's result comes back — never synchronously in `load` itself. The
  // "loading" transition is set by whichever user interaction (select change,
  // retry click) triggered the refetch, not by this effect.
  const load = useCallback(() => {
    const walletId = getWalletId();
    if (!walletId) {
      signOut();
      router.replace('/login');
      return;
    }

    fetchDashboard({ walletId, month, year })
      .then((result) => {
        setData(result);
        setState(result.expenses.length === 0 ? 'empty' : 'success');
      })
      .catch((error) => {
        if (error instanceof SessionExpiredError) {
          signOut();
          router.replace('/login');
          return;
        }
        setErrorMessage(
          error instanceof Error ? error.message : GENERIC_ERROR_MESSAGE,
        );
        setState('error');
      });
  }, [month, year, router]);

  useEffect(() => {
    load();
  }, [load]);

  function handleMonthChange(value: number) {
    setMonth(value);
    setState('loading');
  }

  function handleYearChange(value: number) {
    setYear(value);
    setState('loading');
  }

  function handlePrevMonth() {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
    setState('loading');
  }

  function handleNextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
    setState('loading');
  }

  function handleRetry() {
    setState('loading');
    load();
  }

  function handleLogout() {
    signOut();
    router.replace('/login');
  }

  function handleCreateExpense() {
    setModalOpen(false);
    setState('loading');
    load();
  }

  return (
    <AppShell activePath='dashboard' onLogout={handleLogout}>
      <main className='flex w-full flex-col gap-space-lg px-space-md py-space-lg md:px-space-lg'>
        <div className='flex flex-col gap-space-md lg:flex-row lg:items-center sm:justify-between'>
          <div className='min-w-fit'>
            <h1 className='text-headline-lg text-base-content'>Dashboard</h1>
            <p className='text-body-lg text-base-content/60'>
              Visão geral das suas despesas.
            </p>
          </div>
          <div className='w-full justify-start flex flex-col gap-space-sm sm:flex-row sm:items-center lg:justify-end'>
            <div className='join w-full sm:w-auto'>
              <button
                type='button'
                aria-label='Mês anterior'
                disabled={state === 'loading'}
                onClick={handlePrevMonth}
                className='btn join-item border-base-300 bg-base-100 px-space-sm'
              >
                <span className='material-symbols-outlined text-[20px]'>
                  chevron_left
                </span>
              </button>
              <select
                value={month}
                disabled={state === 'loading'}
                onChange={(event) =>
                  handleMonthChange(Number(event.target.value))
                }
                className='select join-item min-w-0 flex-1 cursor-pointer border-base-300 bg-base-100 outline-none! hover:bg-base-200 focus:outline-none! focus:border-primary! [&:open]:outline-none! [&:open]:border-primary! sm:w-37.5 sm:flex-none'
              >
                {MONTH_NAMES.map((name, index) => (
                  <option key={name} value={index + 1}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                value={year}
                disabled={state === 'loading'}
                onChange={(event) =>
                  handleYearChange(Number(event.target.value))
                }
                className='select join-item min-w-0 flex-1 cursor-pointer border-base-300 bg-base-100 outline-none! hover:bg-base-200 focus:outline-none! focus:border-primary! [&:open]:outline-none! [&:open]:border-primary! sm:w-25 sm:flex-none'
              >
                {yearOptions(now.getFullYear(), year).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <button
                type='button'
                aria-label='Próximo mês'
                disabled={state === 'loading'}
                onClick={handleNextMonth}
                className='btn join-item border-base-300 bg-base-100 px-space-sm'
              >
                <span className='material-symbols-outlined text-[20px]'>
                  chevron_right
                </span>
              </button>
            </div>
            <PrimaryButton
              icon='add'
              className='min-w-47'
              onClick={() => setModalOpen(true)}
            >
              Nova Despesa
            </PrimaryButton>
          </div>
        </div>

        {state === 'loading' && <LoadingSkeleton />}
        {state === 'error' && (
          <ErrorState message={errorMessage} onRetry={handleRetry} />
        )}
        {state === 'empty' && (
          <EmptyState monthLabel={MONTH_NAMES[month - 1]} year={year} />
        )}
        {state === 'success' && data && <DashboardContent data={data} />}
      </main>

      <NewExpenseModal
        open={modalOpen}
        walletId={walletId}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateExpense}
      />
    </AppShell>
  );
}

function DashboardContent({ data }: { data: DashboardData }) {
  return (
    <>
      <div className='stats w-full shadow-md bg-base-100'>
        <div className='stat'>
          <div className='stat-figure text-primary flex items-center justify-center'>
            <span className='material-symbols-outlined text-[32px]'>
              account_balance_wallet
            </span>
          </div>
          <div className='stat-title text-label-md uppercase tracking-widest'>
            Total de Despesas
          </div>
          <div className='stat-value text-headline-lg text-base-content'>
            {currencyFormatter.format(data.total)}
          </div>
        </div>
      </div>

      <div className='card bg-base-100 shadow-md'>
        <div className='card-body p-0'>
          <div className='flex items-center justify-between border-b border-base-200 p-space-lg'>
            <h2 className='card-title text-title-lg text-base-content'>
              Despesas do Mês
            </h2>
            <span className='badge badge-ghost text-body-md'>
              {data.expenses.length}{' '}
              {data.expenses.length === 1 ? 'despesa' : 'despesas'}
            </span>
          </div>
          <div className='overflow-x-auto'>
            <table className='table'>
              <thead>
                <tr>
                  <th className='text-label-md font-medium uppercase text-base-content/60'>
                    Descrição
                  </th>
                  <th className='text-right text-label-md font-medium uppercase text-base-content/60'>
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.expenses.map((expense) => (
                  <tr key={expense.dashboardExpenseId} className='hover'>
                    <td className='text-body-md text-base-content'>
                      <div className='flex items-center gap-3'>
                        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
                          <span className='material-symbols-outlined text-[20px]'>
                            receipt_long
                          </span>
                        </div>
                        <span className='truncate'>
                          {expense.dashboardExpenseDescription}
                        </span>
                      </div>
                    </td>
                    <td className='text-right text-body-md font-medium text-error'>
                      -{currencyFormatter.format(expense.dashboardExpenseCost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className='flex flex-col gap-space-lg'>
      <div className='skeleton h-24 w-full rounded-box' />
      <div className='card bg-base-100 shadow-md'>
        <div className='card-body gap-space-md'>
          <div className='flex items-center justify-between'>
            <div className='skeleton h-6 w-40' />
            <div className='skeleton h-5 w-16' />
          </div>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className='flex items-center justify-between'>
              <div className='flex items-center gap-space-md'>
                <div className='skeleton h-10 w-10 shrink-0 rounded-full' />
                <div className='skeleton h-4 w-32' />
              </div>
              <div className='skeleton h-4 w-16' />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  monthLabel,
  year,
}: {
  monthLabel: string;
  year: number;
}) {
  return (
    <div className='hero min-h-100 rounded-box bg-base-100 shadow-md'>
      <div className='hero-content flex-col text-center'>
        <div className='flex h-24 w-24 items-center justify-center rounded-full bg-primary/10'>
          <span
            className='material-symbols-outlined text-[48px] text-primary'
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            wallet
          </span>
        </div>
        <h2 className='mt-space-lg text-title-lg text-base-content'>
          Nenhuma despesa encontrada
        </h2>
        <p className='max-w-md text-body-md text-base-content/60'>
          Não há despesas registradas para {monthLabel} de {year}.
        </p>
      </div>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className='hero min-h-100 rounded-box bg-base-100 shadow-md'>
      <div className='hero-content flex-col text-center'>
        <div className='flex h-24 w-24 items-center justify-center rounded-full bg-error/10'>
          <span
            className='material-symbols-outlined text-[48px] text-error'
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            error
          </span>
        </div>
        <h2 className='mt-space-lg text-headline-md tracking-tight text-base-content'>
          Ocorreu um erro ao carregar o dashboard
        </h2>
        <p className='max-w-sm text-body-lg text-base-content/60'>{message}</p>
        <button
          type='button'
          onClick={onRetry}
          className='btn btn-outline btn-primary mt-space-sm'
        >
          <span className='material-symbols-outlined text-[18px]'>refresh</span>
          Tentar Novamente
        </button>
      </div>
    </div>
  );
}
