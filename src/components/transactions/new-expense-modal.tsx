"use client";

import { useEffect, useState, type FormEvent } from "react";
import { fetchCardsToInput, type CardOption } from "@/lib/cards";
import type { Transaction } from "@/lib/transactions";

const PAYMENT_METHODS = ["Cartão de Crédito", "Débito", "Dinheiro", "Pix"] as const;
const INSTALLMENT_OPTIONS = ["À vista", "Parcelado", "Recorrente"] as const;
type InstallmentOption = (typeof INSTALLMENT_OPTIONS)[number];

function formatDateLabel(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  const MONTH_ABBR = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];
  return `${day} ${MONTH_ABBR[Number(month) - 1]} ${year}`;
}

type NewExpenseModalProps = {
  open: boolean;
  walletId: string | null;
  onClose: () => void;
  onCreate: (transaction: Transaction) => void;
};

export function NewExpenseModal({ open, walletId, onClose, onCreate }: NewExpenseModalProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<(typeof PAYMENT_METHODS)[number]>(
    PAYMENT_METHODS[0]
  );
  const [cardId, setCardId] = useState("");
  const [installmentOption, setInstallmentOption] = useState<InstallmentOption>("À vista");
  const [installments, setInstallments] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [cards, setCards] = useState<CardOption[]>([]);

  useEffect(() => {
    if (!open || !walletId) return;
    fetchCardsToInput({ walletId })
      .then(setCards)
      .catch(() => setCards([]));
  }, [open, walletId]);

  if (!open) return null;

  function resetForm() {
    setDescription("");
    setAmount("");
    setPaymentMethod(PAYMENT_METHODS[0]);
    setCardId("");
    setInstallmentOption("À vista");
    setInstallments("");
    setPurchaseDate("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!description || !amount || !purchaseDate) return;

    const paymentDetail =
      installmentOption === "Parcelado" && installments
        ? `Parcelado 1/${installments}`
        : installmentOption === "Recorrente"
          ? "Recorrente"
          : undefined;

    onCreate({
      id: crypto.randomUUID(),
      dateLabel: formatDateLabel(purchaseDate),
      description,
      paymentLabel: paymentMethod,
      paymentDetail,
      amount: Number(amount),
      kind: "despesa",
      status: "pago",
    });
    resetForm();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/60 p-space-md backdrop-blur-sm">
      <div className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-2xl">
        <div className="flex items-start justify-between border-b border-outline-variant/30 p-space-lg">
          <div className="flex items-center gap-space-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error-container">
              <span className="material-symbols-outlined text-[20px] text-on-error-container">
                remove
              </span>
            </div>
            <h2 className="text-title-lg text-on-surface">Nova Despesa</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar"
            className="text-on-surface-variant transition-colors hover:text-on-surface md:cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-space-lg overflow-y-auto p-space-lg">
          <Field label="Descrição">
            <input
              required
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Ex: Supermercado, Aluguel..."
              className="w-full rounded-lg border border-outline-variant/30 bg-surface px-space-md py-space-sm text-body-lg text-on-surface outline-none focus:ring-0"
            />
          </Field>

          <Field label="Valor (R$)">
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0,00"
              className="w-full rounded-lg border border-outline-variant/30 bg-surface-container px-space-md py-space-sm text-body-lg text-on-surface outline-none focus:ring-0"
            />
          </Field>

          <div className="grid grid-cols-2 gap-space-md">
            <Field label="Forma de Pagamento">
              <select
                value={paymentMethod}
                onChange={(event) =>
                  setPaymentMethod(event.target.value as (typeof PAYMENT_METHODS)[number])
                }
                className="w-full rounded-lg border border-outline-variant/30 bg-surface px-space-md py-space-sm text-body-lg text-on-surface outline-none focus:ring-0 md:cursor-pointer"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Carteira / Cartão">
              <select
                value={cardId}
                onChange={(event) => setCardId(event.target.value)}
                className="w-full rounded-lg border border-outline-variant/30 bg-surface px-space-md py-space-sm text-body-lg text-on-surface outline-none focus:ring-0 md:cursor-pointer"
              >
                <option value="">Selecione</option>
                {cards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-space-md">
            <Field label="Método de Pagamento">
              <div className="flex gap-space-sm">
                {INSTALLMENT_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setInstallmentOption(option)}
                    className={`flex-1 rounded-lg border-2 px-space-sm py-space-sm text-body-md font-medium transition-colors md:cursor-pointer ${
                      installmentOption === option
                        ? "border-primary bg-primary-container text-on-primary-container"
                        : "border-transparent bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Número de Parcelas">
              <input
                type="number"
                min="2"
                disabled={installmentOption !== "Parcelado"}
                value={installments}
                onChange={(event) => setInstallments(event.target.value)}
                placeholder="Ex: 12"
                className="w-full rounded-lg border border-outline-variant/30 bg-surface px-space-md py-space-sm text-body-lg text-on-surface outline-none focus:ring-0 disabled:opacity-40"
              />
            </Field>
          </div>

          <Field label="Data da Compra">
            <input
              required
              type="date"
              value={purchaseDate}
              onChange={(event) => setPurchaseDate(event.target.value)}
              className="w-full rounded-lg border border-outline-variant/30 bg-surface px-space-md py-space-sm text-body-lg text-on-surface outline-none focus:ring-0"
            />
          </Field>

          <div className="flex justify-end gap-space-sm border-t border-outline-variant/30 pt-space-md">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg px-space-lg py-space-sm text-body-lg font-medium text-on-surface-variant transition-colors hover:bg-surface-container md:cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-space-xs rounded-lg bg-primary px-space-lg py-space-sm text-body-lg font-medium text-on-primary shadow-sm transition-colors hover:bg-primary/90 md:cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Salvar Despesa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-space-xs">
      <span className="text-body-md text-on-surface-variant">{label}</span>
      {children}
    </label>
  );
}
