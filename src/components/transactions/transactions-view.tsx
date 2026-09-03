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
import { PrimaryButton } from '@/components/ui/primary-button';

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

const STATUS_BADGE: Record<TransactionStatus, string> = {
  pago: 'badge-success',
  pendente: 'badge-warning',
  recebido: 'badge-success',
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
            <h1 className='text-headline-lg text-base-content'>Transações</h1>
            <p className='text-body-lg text-base-content/60'>
              Gerencie suas receitas e despesas.
            </p>
          </div>
          <PrimaryButton
            icon='add'
            className='min-w-47'
            onClick={() => setModalOpen(true)}
          >
            Nova Despesa
          </PrimaryButton>
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
      <div className='stats stats-vertical sm:stats-horizontal w-full bg-base-100 shadow-md'>
        <StatCard label='Saldo Atual' value={currencyFormatter.format(summary.currentBalance)} />
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
        <div className='stat opacity-60'>
          <button type='button' disabled title='Em breve' className='flex flex-col items-center gap-space-xs disabled:cursor-default'>
            <span className='material-symbols-outlined text-[24px]'>download</span>
            <span className='stat-title text-label-md uppercase tracking-widest'>
              Exportar Relatório
            </span>
          </button>
        </div>
      </div>

      <div className='card bg-base-100 shadow-md'>
        <div className='card-body p-0'>
          <div className='flex items-center justify-between p-space-lg'>
            <h2 className='card-title text-title-lg text-base-content'>Últimos Lançamentos</h2>
            <div className='flex gap-space-sm'>
              <span title='Em breve' className='badge badge-ghost cursor-default opacity-60'>
                Filtrar
              </span>
              <span title='Em breve' className='badge badge-ghost cursor-default opacity-60'>
                Ordenar
              </span>
            </div>
          </div>
          <div className='overflow-x-auto'>
            <table className='table'>
              <thead>
                <tr>
                  <th className='text-label-md font-medium uppercase text-base-content/60'>
                    Data
                  </th>
                  <th className='text-label-md font-medium uppercase text-base-content/60'>
                    Descrição
                  </th>
                  <th className='text-label-md font-medium uppercase text-base-content/60'>
                    Pagamento
                  </th>
                  <th className='text-right text-label-md font-medium uppercase text-base-content/60'>
                    Valor
                  </th>
                  <th className='text-right text-label-md font-medium uppercase text-base-content/60'>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className='hover'>
                    <td className='text-body-md text-base-content/60'>
                      {transaction.dateLabel}
                    </td>
                    <td className='text-body-md text-base-content'>
                      <div className='flex items-center gap-3'>
                        <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary'>
                          <span className='material-symbols-outlined text-[18px]'>
                            receipt_long
                          </span>
                        </div>
                        <span className='truncate font-medium'>
                          {transaction.description}
                        </span>
                      </div>
                    </td>
                    <td className='text-body-md text-base-content/60'>
                      {transaction.paymentLabel}
                      {transaction.paymentDetail && (
                        <span className='ml-space-xs text-label-md opacity-60'>
                          ({transaction.paymentDetail})
                        </span>
                      )}
                    </td>
                    <td
                      className={`text-right text-body-md font-medium ${
                        transaction.kind === 'receita'
                          ? 'text-success'
                          : 'text-base-content'
                      }`}
                    >
                      {transaction.kind === 'receita' ? '+ ' : '- '}
                      {currencyFormatter.format(transaction.amount)}
                    </td>
                    <td className='text-right'>
                      <span className={`badge ${STATUS_BADGE[transaction.status]} badge-soft gap-1`}>
                        {STATUS_LABEL[transaction.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className='flex justify-center p-space-md'>
            <span title='Em breve' className='cursor-default text-body-md text-primary opacity-60'>
              Ver todas as transações
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  valueClass = 'text-base-content',
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className='stat'>
      <span className='stat-title text-label-md uppercase tracking-widest'>{label}</span>
      <div className={`stat-value text-headline-md ${valueClass}`}>{value}</div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className='flex flex-col gap-space-lg'>
      <div className='grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4'>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className='skeleton h-32 w-full rounded-box' />
        ))}
      </div>
      <div className='skeleton h-96 w-full rounded-box' />
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
        <h2 className='mt-space-lg text-headline-lg tracking-tight text-base-content'>
          Ocorreu um erro ao carregar suas transações
        </h2>
        <p className='max-w-sm text-body-lg text-base-content/60'>{message}</p>
        <button type='button' onClick={onRetry} className='btn btn-outline btn-primary mt-space-sm'>
          <span className='material-symbols-outlined text-[18px]'>refresh</span>
          Tentar Novamente
        </button>
      </div>
    </div>
  );
}
