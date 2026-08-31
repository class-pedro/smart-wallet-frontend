"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { fetchCardsToInput, type CardOption } from "@/lib/cards";
import { centsFromDigits, formatBRL } from "@/lib/currency";
import {
  createExpense,
  type ExpensePaymentMethod,
  type ExpensePaymentType,
  type Transaction,
} from "@/lib/transactions";

const PAYMENT_METHODS = ["Cartão de Crédito", "Débito", "Dinheiro", "Pix"] as const;
const INSTALLMENT_OPTIONS = ["À vista", "Parcelado", "Recorrente"] as const;
type InstallmentOption = (typeof INSTALLMENT_OPTIONS)[number];

/** The backend has no dedicated Pix payment type — it's treated as money, same as Dinheiro. */
const PAYMENT_TYPE_MAP: Record<(typeof PAYMENT_METHODS)[number], ExpensePaymentType> = {
  "Cartão de Crédito": "credit",
  "Débito": "debit",
  Dinheiro: "money",
  Pix: "money",
};

const INSTALLMENT_METHOD_MAP: Record<InstallmentOption, ExpensePaymentMethod> = {
  "À vista": "payInFull",
  Parcelado: "installment",
  Recorrente: "recurrent",
};

const GENERIC_ERROR_MESSAGE =
  "Não foi possível salvar a despesa. Por favor, verifique os dados e tente novamente.";

function formatDateLabel(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  const MONTH_ABBR = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];
  return `${day} ${MONTH_ABBR[Number(month) - 1]} ${year}`;
}

function todayISODate(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

type NewExpenseModalProps = {
  open: boolean;
  walletId: string | null;
  onClose: () => void;
  onCreate: (transaction: Transaction) => void;
};

export function NewExpenseModal({ open, walletId, onClose, onCreate }: NewExpenseModalProps) {
  const [description, setDescription] = useState("");
  const [amountCents, setAmountCents] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<(typeof PAYMENT_METHODS)[number]>(
    PAYMENT_METHODS[0]
  );
  const [cardId, setCardId] = useState("");
  const [installmentOption, setInstallmentOption] = useState<InstallmentOption>("À vista");
  const [installments, setInstallments] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [cards, setCards] = useState<CardOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !walletId) return;
    fetchCardsToInput({ walletId })
      .then(setCards)
      .catch(() => setCards([]));
  }, [open, walletId]);

  if (!open) return null;

  const requiresCard = PAYMENT_TYPE_MAP[paymentMethod] !== "money";

  function resetForm() {
    setDescription("");
    setAmountCents(0);
    setPaymentMethod(PAYMENT_METHODS[0]);
    setCardId("");
    setInstallmentOption("À vista");
    setInstallments("");
    setPurchaseDate("");
    setErrorMessage(null);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleAmountChange(event: ChangeEvent<HTMLInputElement>) {
    setAmountCents(centsFromDigits(event.target.value));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!description || amountCents === 0 || !walletId) return;
    if (requiresCard && !cardId) {
      setErrorMessage("Selecione um cartão para continuar.");
      return;
    }

    const effectivePurchaseDate = purchaseDate || todayISODate();
    const installmentsCount =
      installmentOption === "Parcelado" && installments ? Number(installments) : undefined;

    setSubmitting(true);
    setErrorMessage(null);
    try {
      await createExpense({
        description,
        costCents: amountCents,
        paymentType: PAYMENT_TYPE_MAP[paymentMethod],
        paymentMethod: INSTALLMENT_METHOD_MAP[installmentOption],
        purchaseDate: effectivePurchaseDate,
        installments: installmentsCount,
        walletId: requiresCard ? undefined : walletId,
        cardId: requiresCard ? cardId : undefined,
      });

      const paymentDetail =
        installmentOption === "Parcelado" && installments
          ? `Parcelado 1/${installments}`
          : installmentOption === "Recorrente"
            ? "Recorrente"
            : undefined;

      onCreate({
        id: crypto.randomUUID(),
        dateLabel: formatDateLabel(effectivePurchaseDate),
        description,
        paymentLabel: paymentMethod,
        paymentDetail,
        amount: amountCents / 100,
        kind: "despesa",
        status: "pago",
      });
      resetForm();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : GENERIC_ERROR_MESSAGE);
    } finally {
      setSubmitting(false);
    }
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

          <Field label="Valor">
            <input
              type="text"
              inputMode="numeric"
              value={formatBRL(amountCents / 100)}
              onChange={handleAmountChange}
              className="w-full rounded-lg border border-outline-variant/30 bg-surface-container px-space-md py-space-sm text-body-lg text-on-surface outline-none focus:ring-0"
            />
          </Field>

          <div className={requiresCard ? "grid grid-cols-2 gap-space-md" : "grid grid-cols-1"}>
            <Field label="Forma de Pagamento">
              <select
                value={paymentMethod}
                onChange={(event) => {
                  setPaymentMethod(event.target.value as (typeof PAYMENT_METHODS)[number]);
                  setCardId("");
                }}
                className="w-full rounded-lg border border-outline-variant/30 bg-surface px-space-md py-space-sm text-body-lg text-on-surface outline-none focus:ring-0 md:cursor-pointer"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </Field>
            {requiresCard && (
              <Field label="Cartão">
                <select
                  required
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
            )}
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

          <Field
            label="Data da Compra"
            hint="Se não for preenchida, é usada a data de hoje."
          >
            <input
              type="date"
              value={purchaseDate}
              onChange={(event) => setPurchaseDate(event.target.value)}
              className="w-full rounded-lg border border-outline-variant/30 bg-surface px-space-md py-space-sm text-body-lg text-on-surface outline-none focus:ring-0"
            />
          </Field>

          {errorMessage && (
            <p className="rounded-lg bg-error/10 px-space-md py-space-sm text-body-md text-error">
              {errorMessage}
            </p>
          )}

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
              disabled={submitting}
              className="flex items-center gap-space-xs rounded-lg bg-primary px-space-lg py-space-sm text-body-lg font-medium text-on-primary shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60 md:cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              {submitting ? "Salvando..." : "Salvar Despesa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-space-xs">
      <span className="flex items-center gap-space-xs text-body-md text-on-surface-variant">
        {label}
        {hint && (
          <span
            title={hint}
            aria-label={hint}
            tabIndex={0}
            className="material-symbols-outlined cursor-help text-[16px] text-on-surface-variant/60"
          >
            info
          </span>
        )}
      </span>
      {children}
    </label>
  );
}
