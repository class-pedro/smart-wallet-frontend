"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getWalletId, signOut, SessionExpiredError } from "@/lib/auth";
import { fetchCards, type CardStatus, type CreditCard } from "@/lib/cards";
import { AppShell } from "@/components/layout/app-shell";
import { NewCardModal } from "@/components/cards/new-card-modal";

type ViewState = "loading" | "success" | "empty" | "error";

const GENERIC_ERROR_MESSAGE =
  "Não foi possível buscar seus cartões. Por favor, verifique sua conexão e tente novamente.";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const STATUS_LABEL: Record<CardStatus, string> = {
  aberta: "Aberta",
  fechada: "Fechada",
  paga: "Paga",
};

const STATUS_CLASSES: Record<CardStatus, string> = {
  aberta: "bg-success/10 text-success",
  fechada: "bg-error/10 text-error",
  paga: "bg-surface-container-high text-on-surface-variant",
};

const TILE_ACCENTS = [
  "bg-primary/10 text-primary",
  "bg-tertiary/10 text-tertiary",
  "bg-surface-container-highest text-on-surface-variant",
];

export function CardsView() {
  const router = useRouter();
  const [state, setState] = useState<ViewState>("loading");
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [errorMessage, setErrorMessage] = useState(GENERIC_ERROR_MESSAGE);
  const [modalOpen, setModalOpen] = useState(false);
  const walletId = getWalletId();

  const load = useCallback(() => {
    const walletId = getWalletId();
    if (!walletId) {
      signOut();
      router.replace("/login");
      return;
    }

    fetchCards({ walletId })
      .then((result) => {
        setCards(result);
        setState(result.length === 0 ? "empty" : "success");
      })
      .catch((error) => {
        if (error instanceof SessionExpiredError) {
          signOut();
          router.replace("/login");
          return;
        }
        setErrorMessage(error instanceof Error ? error.message : GENERIC_ERROR_MESSAGE);
        setState("error");
      });
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  function handleRetry() {
    setState("loading");
    load();
  }

  function handleLogout() {
    signOut();
    router.replace("/login");
  }

  function handleCreateCard() {
    setModalOpen(false);
    load();
  }

  return (
    <AppShell activePath="cartoes" onLogout={handleLogout}>
      <main className="flex w-full flex-col gap-space-lg px-space-md py-space-lg md:px-space-lg">
        <div className="flex flex-col gap-space-md sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-headline-lg text-on-surface">Meus Cartões</h1>
            <p className="text-body-lg text-on-surface-variant">
              Gerencie seus limites e faturas.
            </p>
          </div>
          {state !== "empty" && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-space-sm self-start rounded-lg bg-primary px-space-lg py-space-sm text-body-lg font-medium text-on-primary shadow-sm transition-colors hover:bg-primary/90 md:cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Adicionar Cartão
            </button>
          )}
        </div>

        {state === "loading" && <LoadingSkeleton />}
        {state === "error" && <ErrorState message={errorMessage} onRetry={handleRetry} />}
        {state === "empty" && <EmptyState onAddCard={() => setModalOpen(true)} />}
        {state === "success" && <CardsContent cards={cards} onAddCard={() => setModalOpen(true)} />}
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
      <div className="grid grid-cols-1 gap-space-lg sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, index) => (
          <CardTile key={card.id} card={card} accentClass={TILE_ACCENTS[index % TILE_ACCENTS.length]} />
        ))}
        <button
          type="button"
          onClick={onAddCard}
          className="flex min-h-55 flex-col items-center justify-center gap-space-sm rounded-xl border-2 border-dashed border-outline-variant bg-surface-container p-space-lg text-center transition-colors hover:bg-surface-container-high md:cursor-pointer"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-container">
            <span className="material-symbols-outlined text-[22px] text-on-secondary-container">
              add_card
            </span>
          </div>
          <span className="text-title-lg text-on-surface">Novo Cartão</span>
          <span className="text-body-md text-on-surface-variant">
            Adicione um novo cartão de crédito
          </span>
        </button>
      </div>

      <div className="overflow-hidden rounded-xl bg-surface-container shadow-sm">
        <div className="flex items-center justify-between border-b border-surface-container-high p-space-lg">
          <h2 className="text-title-lg text-on-surface">Detalhamento de Faturas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-175 border-collapse text-left">
            <thead>
              <tr className="bg-surface-container-high">
                <th className="p-space-md text-label-md font-medium uppercase text-on-surface-variant">
                  Cartão
                </th>
                <th className="p-space-md text-label-md font-medium uppercase text-on-surface-variant">
                  Final
                </th>
                <th className="p-space-md text-label-md font-medium uppercase text-on-surface-variant">
                  Vencimento
                </th>
                <th className="p-space-md text-label-md font-medium uppercase text-on-surface-variant">
                  Status
                </th>
                <th className="p-space-md text-right text-label-md font-medium uppercase text-on-surface-variant">
                  Valor Total
                </th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card, index) => (
                <tr key={card.id} className="group transition-colors hover:bg-surface-container-high">
                  <td className="flex items-center gap-3 p-space-md text-body-md text-on-surface">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded ${TILE_ACCENTS[index % TILE_ACCENTS.length]}`}
                    >
                      <span className="material-symbols-outlined text-[18px]">credit_card</span>
                    </div>
                    <span className="truncate font-medium">{card.name}</span>
                  </td>
                  <td className="p-space-md text-body-md text-on-surface-variant">••••</td>
                  <td className="p-space-md text-body-md text-on-surface">{card.dueDateLabel}</td>
                  <td className="p-space-md">
                    <span
                      className={`rounded-full px-space-sm py-unit text-label-md font-medium ${STATUS_CLASSES[card.status]}`}
                    >
                      {STATUS_LABEL[card.status]}
                    </span>
                  </td>
                  <td className="p-space-md text-right text-body-md font-medium text-on-surface">
                    {currencyFormatter.format(card.currentInvoice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function CardTile({ card, accentClass }: { card: CreditCard; accentClass: string }) {
  const usagePercent = Math.min(100, Math.round((card.currentInvoice / card.creditLimit) * 100));
  const invoiceLabel =
    card.status === "aberta" ? "Fatura Atual" : card.status === "fechada" ? "Fatura Fechada" : "Fatura Paga";

  return (
    <div className="relative overflow-hidden rounded-xl bg-surface-container p-space-lg shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <span className="block text-label-md uppercase tracking-widest text-on-surface-variant">
            {card.name}
          </span>
          <div className="mt-space-xs text-headline-md text-on-surface">
            {currencyFormatter.format(card.currentInvoice)}
          </div>
          <span className="text-body-md text-on-surface-variant">{invoiceLabel}</span>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded ${accentClass}`}>
          <span className="material-symbols-outlined text-[20px]">credit_card</span>
        </div>
      </div>

      <div className="mt-space-lg flex flex-col gap-space-xs">
        <div className="flex items-center justify-between text-body-md">
          <span className="text-on-surface-variant">Limite Utilizado</span>
          <span className="text-on-surface">
            {currencyFormatter.format(card.currentInvoice)} / {currencyFormatter.format(card.creditLimit)}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
          <div className="h-full rounded-full bg-primary" style={{ width: `${usagePercent}%` }} />
        </div>
      </div>

      <div className="mt-space-md flex items-end justify-between">
        <div>
          <span className="block text-label-md font-medium uppercase text-on-surface-variant">
            Vencimento
          </span>
          <span className="text-title-lg text-on-surface">{card.dueDateLabel}</span>
        </div>
        <span
          className={`rounded-full px-space-sm py-unit text-label-md font-medium ${STATUS_CLASSES[card.status]}`}
        >
          {STATUS_LABEL[card.status]}
        </span>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-space-lg">
      <div className="grid grid-cols-1 gap-space-lg sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-55 rounded-xl bg-surface-container-low shadow-sm" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-surface-container-low shadow-sm" />
    </div>
  );
}

function EmptyState({ onAddCard }: { onAddCard: () => void }) {
  return (
    <div className="flex min-h-100 flex-col items-center justify-center rounded-xl bg-surface-container-lowest p-space-xl text-center shadow-sm">
      <div className="mb-space-lg flex h-24 w-24 items-center justify-center rounded-full bg-secondary-container shadow-md">
        <span
          className="material-symbols-outlined text-[48px] text-on-secondary-container"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          credit_card
        </span>
      </div>
      <h2 className="mb-space-sm text-headline-md text-on-surface">Nenhum cartão cadastrado</h2>
      <p className="mb-space-lg max-w-sm text-body-lg text-on-surface-variant">
        Cadastre seus cartões de crédito para gerenciar seus limites e vencimentos em um só lugar.
      </p>
      <button
        type="button"
        onClick={onAddCard}
        className="flex items-center gap-space-sm rounded-xl bg-primary px-space-xl py-space-md text-title-lg font-medium text-on-primary shadow-sm transition-all hover:shadow-md active:scale-95 md:cursor-pointer"
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
        Adicionar Primeiro Cartão
      </button>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-100 items-center justify-center rounded-xl p-space-lg">
      <div className="flex w-full max-w-lg flex-col items-center rounded-4xl border border-outline-variant/10 bg-surface-container/30 p-space-xl text-center shadow-xl backdrop-blur-sm">
        <div className="mb-space-lg flex h-24 w-24 items-center justify-center rounded-full bg-surface shadow-md">
          <span
            className="material-symbols-outlined text-[48px] text-error"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            error
          </span>
        </div>
        <h2 className="mb-space-sm text-headline-lg tracking-tight text-on-surface">
          Ocorreu um erro ao carregar seus cartões
        </h2>
        <p className="mb-space-xl max-w-sm text-body-lg text-on-surface-variant">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-space-sm rounded-xl bg-secondary-container px-space-xl py-space-md text-title-lg font-medium text-on-secondary-container shadow-sm transition-all hover:shadow-md active:scale-95 md:cursor-pointer"
        >
          <span className="material-symbols-outlined">refresh</span>
          Tentar Novamente
        </button>
      </div>
    </div>
  );
}
