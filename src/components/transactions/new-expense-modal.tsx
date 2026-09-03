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
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl p-0">
        <div className="flex items-start justify-between border-b border-base-300 p-space-lg">
          <div className="flex items-center gap-space-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error/10">
              <span className="material-symbols-outlined text-[20px] text-error">
                remove
              </span>
            </div>
            <h2 className="text-title-lg text-base-content">Nova Despesa</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar"
            className="btn btn-ghost btn-square btn-sm"
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
              className="input input-bordered w-full text-body-lg outline-none! focus:outline-none! focus:border-primary!"
            />
          </Field>

          <Field label="Valor">
            <input
              type="text"
              inputMode="numeric"
              value={formatBRL(amountCents / 100)}
              onChange={handleAmountChange}
              className="input input-bordered w-full text-body-lg outline-none! focus:outline-none! focus:border-primary!"
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
                className="select select-bordered w-full text-body-lg outline-none! focus:outline-none! focus:border-primary! [&:open]:outline-none! [&:open]:border-primary!"
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
                  className="select select-bordered w-full text-body-lg outline-none! focus:outline-none! focus:border-primary! [&:open]:outline-none! [&:open]:border-primary!"
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
              <div className="join w-full">
                {INSTALLMENT_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setInstallmentOption(option)}
                    className={`btn join-item flex-1 text-body-md font-medium ${
                      installmentOption === option ? "btn-primary" : "btn-ghost bg-base-200"
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
                className="input input-bordered w-full text-body-lg outline-none! focus:outline-none! focus:border-primary! disabled:opacity-40"
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
              className="input input-bordered w-full text-body-lg outline-none! focus:outline-none! focus:border-primary!"
            />
          </Field>

          {errorMessage && (
            <div role="alert" className="alert alert-error alert-soft text-body-md">
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="modal-action mt-0 border-t border-base-300 pt-space-md">
            <button type="button" onClick={handleClose} className="btn btn-ghost">
              Cancelar
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              <span className="material-symbols-outlined text-[18px]">save</span>
              {submitting ? "Salvando..." : "Salvar Despesa"}
            </button>
          </div>
        </form>
      </div>
      <button type="button" onClick={handleClose} aria-label="Fechar" className="modal-backdrop" />
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
      <span className="text-body-md text-base-content/70">{label}</span>
      {children}
      {hint && (
        <span className="text-label-md text-base-content/40">{hint}</span>
      )}
    </label>
  );
}
