'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getWalletId, signOut, SessionExpiredError } from '@/lib/auth';
import { fetchCards, type CardStatus, type CreditCard } from '@/lib/cards';
import { AppShell } from '@/components/layout/app-shell';
import { NewCardModal } from '@/components/cards/new-card-modal';
import { PrimaryButton } from '@/components/ui/primary-button';

type ViewState = 'loading' | 'success' | 'empty' | 'error';

const GENERIC_ERROR_MESSAGE =
  'Não foi possível buscar seus cartões. Por favor, verifique sua conexão e tente novamente.';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const STATUS_LABEL: Record<CardStatus, string> = {
  aberta: 'Aberta',
  fechada: 'Fechada',
  paga: 'Paga',
};

const STATUS_BADGE: Record<CardStatus, string> = {
  aberta: 'badge-success',
  fechada: 'badge-error',
  paga: 'badge-neutral',
};

const TILE_ACCENTS = [
  'bg-primary/10 text-primary',
  'bg-accent/10 text-accent',
  'bg-secondary/10 text-secondary',
];

const CARD_FACE_GRADIENTS = [
  'from-primary to-blue-800',
  'from-accent to-orange-800',
  'from-secondary to-teal-800',
];

export function CardsView() {
  const router = useRouter();
  const [state, setState] = useState<ViewState>('loading');
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [errorMessage, setErrorMessage] = useState(GENERIC_ERROR_MESSAGE);
  const [modalOpen, setModalOpen] = useState(false);
  const walletId = getWalletId();

  const load = useCallback(() => {
    const walletId = getWalletId();
    if (!walletId) {
      signOut();
      router.replace('/login');
      return;
    }

    fetchCards({ walletId })
      .then((result) => {
        setCards(result);
        setState(result.length === 0 ? 'empty' : 'success');
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
  }, [router]);

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

  function handleCreateCard() {
    setModalOpen(false);
    load();
  }

  return (
    <AppShell activePath='cartoes' onLogout={handleLogout}>
      <main className='flex w-full flex-col gap-space-lg px-space-md py-space-lg md:px-space-lg'>
        <div className='flex flex-col gap-space-md sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h1 className='text-headline-lg text-base-content'>Meus Cartões</h1>
            <p className='text-body-lg text-base-content/60'>
              Gerencie seus limites e faturas.
            </p>
          </div>
          {state !== 'empty' && (
            <PrimaryButton icon='add' onClick={() => setModalOpen(true)}>
              Adicionar Cartão
            </PrimaryButton>
          )}
        </div>

        {state === 'loading' && <LoadingSkeleton />}
        {state === 'error' && (
          <ErrorState message={errorMessage} onRetry={handleRetry} />
        )}
        {state === 'empty' && (
          <EmptyState onAddCard={() => setModalOpen(true)} />
        )}
        {state === 'success' && (
          <CardsContent cards={cards} onAddCard={() => setModalOpen(true)} />
        )}
      </main>

      <NewCardModal
        open={modalOpen}
        walletId={walletId}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateCard}
      />
    </AppShell>
  );
}

function CardsContent({
  cards,
  onAddCard,
}: {
  cards: CreditCard[];
  onAddCard: () => void;
}) {
  return (
    <>
      <div className='grid grid-cols-1 gap-space-lg sm:grid-cols-2 lg:grid-cols-3'>
        {cards.map((card, index) => (
          <CardTile key={card.id} card={card} index={index} />
        ))}
        {cards?.length < 1 && (
          <button
            type='button'
            onClick={onAddCard}
            className='flex min-h-55 flex-col items-center justify-center gap-space-sm rounded-box border-2 border-dashed border-base-300 bg-base-100 p-space-lg text-center transition-colors hover:bg-base-200 md:cursor-pointer'
          >
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10'>
              <span className='material-symbols-outlined text-[22px] text-secondary'>
                add_card
              </span>
            </div>
            <span className='text-title-lg text-base-content'>Novo Cartão</span>
            <span className='text-body-md text-base-content/60'>
              Adicione um novo cartão de crédito
            </span>
          </button>
        )}
      </div>

      <div className='card bg-base-100 shadow-md'>
        <div className='card-body p-0'>
          <div className='flex items-center justify-between border-b border-base-200 p-space-lg'>
            <h2 className='card-title text-title-lg text-base-content'>
              Detalhamento de Faturas
            </h2>
          </div>
          <div className='overflow-x-auto'>
            <table className='table'>
              <thead>
                <tr>
                  <th className='text-label-md font-medium uppercase text-base-content/60'>
                    Cartão
                  </th>
                  <th className='text-label-md font-medium uppercase text-base-content/60'>
                    Final
                  </th>
                  <th className='text-label-md font-medium uppercase text-base-content/60'>
                    Vencimento
                  </th>
                  <th className='text-label-md font-medium uppercase text-base-content/60'>
                    Status
                  </th>
                  <th className='text-right text-label-md font-medium uppercase text-base-content/60'>
                    Valor Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {cards.map((card, index) => (
                  <tr key={card.id} className='hover'>
                    <td className='text-body-md text-base-content'>
                      <div className='flex items-center gap-3'>
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded ${TILE_ACCENTS[index % TILE_ACCENTS.length]}`}
                        >
                          <span className='material-symbols-outlined text-[18px]'>
                            credit_card
                          </span>
                        </div>
                        <span className='truncate font-medium'>{card.name}</span>
                      </div>
                    </td>
                    <td className='text-body-md text-base-content/60'>••••</td>
                    <td className='text-body-md text-base-content'>
                      {card.dueDateLabel}
                    </td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[card.status]} badge-soft`}>
                        {STATUS_LABEL[card.status]}
                      </span>
                    </td>
                    <td className='text-right text-body-md font-medium text-base-content'>
                      {currencyFormatter.format(card.currentInvoice)}
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

function CardTile({ card, index }: { card: CreditCard; index: number }) {
  const faceRef = useRef<HTMLDivElement>(null);
  const usagePercent = Math.min(
    100,
    Math.round((card.currentInvoice / card.creditLimit) * 100),
  );
  const invoiceLabel =
    card.status === 'aberta'
      ? 'Fatura Atual'
      : card.status === 'fechada'
        ? 'Fatura Fechada'
        : 'Fatura Paga';
  const gradientClass = CARD_FACE_GRADIENTS[index % CARD_FACE_GRADIENTS.length];

  function handleFaceMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const face = faceRef.current;
    if (!face) return;
    const rect = face.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 16;
    const rotateX = (0.5 - py) * 16;
    face.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
    face.style.setProperty('--shine-x', `${px * 100}%`);
    face.style.setProperty('--shine-y', `${py * 100}%`);
    face.style.setProperty('--shine-opacity', '1');
  }

  function handleFaceMouseLeave() {
    const face = faceRef.current;
    if (!face) return;
    face.style.transform = '';
    face.style.setProperty('--shine-opacity', '0');
  }

  return (
    <div className='card bg-base-100 shadow-md transition-shadow hover:shadow-lg'>
      <div className='card-body gap-space-md'>
        <div
          ref={faceRef}
          onMouseMove={handleFaceMouseMove}
          onMouseLeave={handleFaceMouseLeave}
          className={`relative aspect-[1.586/1] w-full overflow-hidden rounded-box p-space-md bg-linear-to-br text-primary-content shadow-md transition-transform duration-200 ease-out will-change-transform ${gradientClass} 2xl:p-space-lg`}
        >
          <div
            aria-hidden
            className='pointer-events-none absolute inset-0 rounded-box transition-opacity duration-200'
            style={{
              opacity: 'var(--shine-opacity, 0)',
              background:
                'radial-gradient(circle at var(--shine-x, 50%) var(--shine-y, 50%), rgba(255,255,255,.35), transparent 60%)',
            }}
          />
          <div className='flex items-start justify-between'>
            <span className='material-symbols-outlined text-[26px]'>
              contactless
            </span>
            <span className='badge badge-sm border-white/30 bg-white/20 uppercase tracking-widest text-white backdrop-blur-sm'>
              {invoiceLabel}
            </span>
          </div>
          <div className='mt-2 tracking-[0.35em] text-xs sm:hidden 2xl:mt-space-lg 2xl:block 2xl:text-title-lg'>
            •••• •••• •••• ••••
          </div>
          <div className='mt-space-md flex items-end justify-between gap-space-sm'>
            <div className='min-w-0'>
              <span className='block text-xs uppercase tracking-widest opacity-80 sm:text-label-md'>
                Cartão
              </span>
              <span className='text-body-md block truncate sm:text-body-lg font-medium'>
                {card.name}
              </span>
            </div>
            <span className='material-symbols-outlined shrink-0 text-[30px]'>
              credit_card
            </span>
          </div>
        </div>

        <div className='text-headline-md text-base-content'>
          {currencyFormatter.format(card.currentInvoice)}
        </div>

        <div className='flex flex-col gap-space-xs'>
          <div className='flex items-center justify-between text-body-md'>
            <span className='text-base-content/60'>Limite Utilizado</span>
            <span className='text-base-content'>
              {currencyFormatter.format(card.currentInvoice)} /{' '}
              {currencyFormatter.format(card.creditLimit)}
            </span>
          </div>
          <progress
            className='progress progress-primary w-full'
            value={usagePercent}
            max={100}
          />
        </div>

        <div className='flex items-end justify-between'>
          <div>
            <span className='block text-label-md font-medium uppercase text-base-content/60'>
              Vencimento
            </span>
            <span className='text-title-lg text-base-content'>{card.dueDateLabel}</span>
          </div>
          <span className={`badge ${STATUS_BADGE[card.status]} badge-soft`}>
            {STATUS_LABEL[card.status]}
          </span>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className='flex flex-col gap-space-lg'>
      <div className='grid grid-cols-1 gap-space-lg sm:grid-cols-2 lg:grid-cols-3'>
        {[0, 1, 2].map((i) => (
          <div key={i} className='skeleton h-55 w-full rounded-box' />
        ))}
      </div>
      <div className='skeleton h-64 w-full rounded-box' />
    </div>
  );
}

function EmptyState({ onAddCard }: { onAddCard: () => void }) {
  return (
    <div className='hero min-h-100 rounded-box bg-base-100 shadow-md'>
      <div className='hero-content flex-col text-center'>
        <div className='flex h-24 w-24 items-center justify-center rounded-full bg-secondary/10'>
          <span
            className='material-symbols-outlined text-[48px] text-secondary'
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            credit_card
          </span>
        </div>
        <h2 className='mt-space-lg text-headline-md text-base-content'>
          Nenhum cartão cadastrado
        </h2>
        <p className='max-w-sm text-body-lg text-base-content/60'>
          Cadastre seus cartões de crédito para gerenciar seus limites e
          vencimentos em um só lugar.
        </p>
        <button type='button' onClick={onAddCard} className='btn btn-primary mt-space-sm'>
          <span className='material-symbols-outlined text-[18px]'>add</span>
          Adicionar Primeiro Cartão
        </button>
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
        <h2 className='mt-space-lg text-headline-lg tracking-tight text-base-content'>
          Ocorreu um erro ao carregar seus cartões
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
