'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getWalletId, signOut } from '@/lib/auth';
import {
  fetchTransactions,
  type Transaction,
  type TransactionsSummary,
  type TransactionStatus,
} from '@/lib/transactions';
import { AppShell } from '@/components/layout/app-shell';
import { NewExpenseModal } from '@/components/transactions/new-expense-modal';

type ViewState = 'loading' | 'success' | 'error';

const GENERIC_ERROR_MESSAGE =
  'Não foi possível buscar suas transações. Por favor, verifique sua conexão e tente novamente.';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const STATUS_LABEL: Record<TransactionStatus, string> = {
  pago: 'Pago',
  pendente: 'Pendente',
  recebido: 'Recebido',
};

const STATUS_CLASSES: Record<TransactionStatus, string> = {
  pago: 'bg-success/10 text-success',
  pendente: 'bg-warning/10 text-warning',
  recebido: 'bg-success/10 text-success',
};

export function TransactionsView() {
  const router = useRouter();
  const [state, setState] = useState<ViewState>('loading');
  const [summary, setSummary] = useState<TransactionsSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [errorMessage, setErrorMessage] = useState(GENERIC_ERROR_MESSAGE);
  const [modalOpen, setModalOpen] = useState(false);
  const walletId = getWalletId();

  const load = useCallback(() => {
    if (!walletId) {
      signOut();
      router.replace('/login');
      return;
    }

    fetchTransactions({ walletId })
      .then((result) => {
        setSummary(result.summary);
        setTransactions(result.transactions);
        setState('success');
      })
      .catch((error) => {
        setErrorMessage(
          error instanceof Error ? error.message : GENERIC_ERROR_MESSAGE,
        );
        setState('error');
      });
  }, [router, walletId]);

  useEffect(() => {
    load();
  }, [load]);

  function handleRetry() {
    setState('loading');
    load();
  }

  function handleLogout() {
    signOut();
    router.replace('/login');
  }

  function handleCreateExpense(transaction: Transaction) {
    setTransactions((prev) => [transaction, ...prev]);
    setSummary((prev) =>
      prev
        ? {
            ...prev,
            currentBalance: prev.currentBalance - transaction.amount,
            monthExpenses: prev.monthExpenses + transaction.amount,
          }
        : prev,
    );
    setModalOpen(false);
  }

  return (
    <AppShell activePath='transacoes' onLogout={handleLogout}>
      <main className='flex w-full flex-col gap-space-lg px-space-md py-space-lg md:px-space-lg'>
        <div className='flex flex-col gap-space-md sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h1 className='text-headline-lg text-on-surface'>Transações</h1>
            <p className='text-body-lg text-on-surface-variant'>
              Gerencie suas receitas e despesas.
            </p>
          </div>
          <button
            type='button'
            onClick={() => setModalOpen(true)}
            className='min-w-47 flex items-center gap-space-sm self-start rounded-lg bg-primary px-space-lg py-space-sm text-body-lg font-medium text-on-primary shadow-sm transition-colors hover:bg-primary/90 md:cursor-pointer'
          >
            <span className='material-symbols-outlined text-[18px]'>add</span>
            Nova Despesa
          </button>
        </div>

        {state === 'loading' && <LoadingSkeleton />}
        {state === 'error' && (
          <ErrorState message={errorMessage} onRetry={handleRetry} />
        )}
        {state === 'success' && summary && (
          <TransactionsContent summary={summary} transactions={transactions} />
        )}
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

function TransactionsContent({
  summary,
  transactions,
}: {
  summary: TransactionsSummary;
  transactions: Transaction[];
}) {
  return (
    <>
      <div className='grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          label='Saldo Atual'
          value={currencyFormatter.format(summary.currentBalance)}
        />
        <StatCard
          label='Despesas Mês'
          value={currencyFormatter.format(summary.monthExpenses)}
          valueClass='text-error'
        />
        <StatCard
          label='Receitas Mês'
          value={currencyFormatter.format(summary.monthIncome)}
          valueClass='text-success'
        />
        <button
          type='button'
          disabled
          title='Em breve'
          className='flex flex-col items-center justify-center gap-space-xs rounded-xl bg-surface-container-high p-space-md text-on-surface-variant disabled:cursor-default disabled:opacity-60'
        >
          <span className='material-symbols-outlined text-[24px]'>
            download
          </span>
          <span className='text-label-md uppercase tracking-widest'>
            Exportar Relatório
          </span>
        </button>
      </div>

      <div className='overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm'>
        <div className='flex items-center justify-between p-space-lg'>
          <h2 className='text-title-lg text-on-surface'>Últimos Lançamentos</h2>
          <div className='flex gap-space-sm'>
            <span
              title='Em breve'
              className='cursor-default rounded-full bg-surface-container px-space-md py-space-xs text-body-md text-on-surface-variant opacity-60'
            >
              Filtrar
            </span>
            <span
              title='Em breve'
              className='cursor-default rounded-full bg-surface-container px-space-md py-space-xs text-body-md text-on-surface-variant opacity-60'
            >
              Ordenar
            </span>
          </div>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-175 border-collapse text-left'>
            <thead>
              <tr className='bg-surface-container-low'>
                <th className='p-space-md text-label-md font-medium uppercase text-on-surface-variant'>
                  Data
                </th>
                <th className='p-space-md text-label-md font-medium uppercase text-on-surface-variant'>
                  Descrição
                </th>
                <th className='p-space-md text-label-md font-medium uppercase text-on-surface-variant'>
                  Pagamento
                </th>
                <th className='p-space-md text-right text-label-md font-medium uppercase text-on-surface-variant'>
                  Valor
                </th>
                <th className='p-space-md text-right text-label-md font-medium uppercase text-on-surface-variant'>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className='border-t border-surface-container-high transition-colors hover:bg-surface-container-high'
                >
                  <td className='p-space-md text-body-md text-on-surface-variant'>
                    {transaction.dateLabel}
                  </td>
                  <td className='flex items-center gap-3 p-space-md text-body-md text-on-surface'>
                    <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container'>
                      <span className='material-symbols-outlined text-[18px]'>
                        receipt_long
                      </span>
                    </div>
                    <span className='truncate font-medium'>
                      {transaction.description}
                    </span>
                  </td>
                  <td className='p-space-md text-body-md text-on-surface-variant'>
                    {transaction.paymentLabel}
                    {transaction.paymentDetail && (
                      <span className='ml-space-xs text-label-md opacity-60'>
                        ({transaction.paymentDetail})
                      </span>
                    )}
                  </td>
                  <td
                    className={`p-space-md text-right text-body-md font-medium ${
                      transaction.kind === 'receita'
                        ? 'text-success'
                        : 'text-on-surface'
                    }`}
                  >
                    {transaction.kind === 'receita' ? '+ ' : '- '}
                    {currencyFormatter.format(transaction.amount)}
                  </td>
                  <td className='p-space-md text-right'>
                    <span
                      className={`inline-flex items-center gap-space-xs rounded-full px-space-sm py-unit text-label-md font-medium ${STATUS_CLASSES[transaction.status]}`}
                    >
                      <span className='h-1.5 w-1.5 rounded-full bg-current' />
                      {STATUS_LABEL[transaction.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className='flex justify-center p-space-md'>
          <span
            title='Em breve'
            className='cursor-default text-body-md text-primary opacity-60'
          >
            Ver todas as transações
          </span>
        </div>
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  valueClass = 'text-on-surface',
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className='rounded-xl bg-surface-container p-space-md shadow-sm'>
      <span className='block text-label-md uppercase tracking-widest text-on-surface-variant'>
        {label}
      </span>
      <div className={`mt-space-xs text-headline-md ${valueClass}`}>
        {value}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className='flex animate-pulse flex-col gap-space-lg'>
      <div className='grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4'>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className='h-32 rounded-xl bg-surface-container-low shadow-sm'
          />
        ))}
      </div>
      <div className='h-96 rounded-xl bg-surface-container-low shadow-sm' />
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
    <div className='flex min-h-100 items-center justify-center rounded-xl p-space-lg'>
      <div className='flex w-full max-w-lg flex-col items-center rounded-4xl border border-outline-variant/10 bg-surface-container/30 p-space-xl text-center shadow-xl backdrop-blur-sm'>
        <div className='mb-space-lg flex h-24 w-24 items-center justify-center rounded-full bg-surface shadow-md'>
          <span
            className='material-symbols-outlined text-[48px] text-error'
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            error
          </span>
        </div>
        <h2 className='mb-space-sm text-headline-lg tracking-tight text-on-surface'>
          Ocorreu um erro ao carregar suas transações
        </h2>
        <p className='mb-space-xl max-w-sm text-body-lg text-on-surface-variant'>
          {message}
        </p>
        <button
          type='button'
          onClick={onRetry}
          className='flex items-center gap-space-sm rounded-xl bg-secondary-container px-space-xl py-space-md text-title-lg font-medium text-on-secondary-container shadow-sm transition-all hover:shadow-md active:scale-95 md:cursor-pointer'
        >
          <span className='material-symbols-outlined'>refresh</span>
          Tentar Novamente
        </button>
      </div>
    </div>
  );
}
