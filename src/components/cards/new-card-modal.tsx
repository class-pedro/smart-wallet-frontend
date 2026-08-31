"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createCard, fetchCardTypes, type CardType } from "@/lib/cards";

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const CARD_TYPE_LABEL: Record<string, string> = {
  credit: "Crédito",
  debit: "Débito",
  multiple: "Múltiplo",
};

const GENERIC_ERROR_MESSAGE =
  "Não foi possível criar o cartão. Por favor, verifique os dados e tente novamente.";

function toCents(value: string): number {
  return Math.round(Number(value) * 100);
}

type NewCardModalProps = {
  open: boolean;
  walletId: string | null;
  onClose: () => void;
  onCreate: () => void;
};

export function NewCardModal({ open, walletId, onClose, onCreate }: NewCardModalProps) {
  const [name, setName] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [balance, setBalance] = useState("");
  const [closingDay, setClosingDay] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [cardTypeId, setCardTypeId] = useState("");
  const [cardTypes, setCardTypes] = useState<CardType[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    fetchCardTypes()
      .then(setCardTypes)
      .catch(() => setCardTypes([]));
  }, [open]);

  if (!open) return null;

  const selectedCardType = cardTypes.find((type) => type.id === cardTypeId);
  const isCredit = selectedCardType?.title === "credit";

  function resetForm() {
    setName("");
    setCreditLimit("");
    setBalance("");
    setClosingDay("");
    setDueDay("");
    setCardTypeId("");
    setErrorMessage(null);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name || !creditLimit || !dueDay || !closingDay || !cardTypeId || !walletId) return;

    setSubmitting(true);
    setErrorMessage(null);
    try {
      await createCard({
        name,
        balance: isCredit ? null : balance ? toCents(balance) : 0,
        dueDateDay: Number(dueDay),
        closingDateDay: Number(closingDay),
        creditLimit: toCents(creditLimit),
        cardTypeId,
        walletId,
      });
      resetForm();
      onCreate();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : GENERIC_ERROR_MESSAGE);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/60 p-space-md backdrop-blur-sm">
      <div className="flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-lg bg-surface-container-lowest shadow-2xl">
        <div className="flex items-start justify-between border-b border-outline-variant/30 p-space-lg">
          <div>
            <h2 className="text-headline-md tracking-tight text-on-surface">Novo Cartão</h2>
            <p className="text-body-md text-on-surface-variant">
              Adicione um novo cartão de crédito para acompanhar seus gastos.
            </p>
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
          <Field label="Nome do Cartão/Banco">
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex: Itaú Visa Infinite"
              className="w-full rounded-lg border border-outline-variant/30 bg-surface px-space-md py-space-sm text-body-md text-on-surface outline-none focus:ring-0"
            />
          </Field>

          <Field label="Tipo de Cartão">
            <select
              required
              value={cardTypeId}
              onChange={(event) => setCardTypeId(event.target.value)}
              className="w-full rounded-lg border border-outline-variant/30 bg-surface px-space-md py-space-sm text-body-md text-on-surface outline-none focus:ring-0 md:cursor-pointer"
            >
              <option value="" disabled>
                Selecione
              </option>
              {cardTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {CARD_TYPE_LABEL[type.title] ?? type.title}
                </option>
              ))}
            </select>
          </Field>

          <div className={isCredit ? "grid grid-cols-1" : "grid grid-cols-2 gap-space-md"}>
            <Field label="Limite de Crédito">
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={creditLimit}
                onChange={(event) => setCreditLimit(event.target.value)}
                placeholder="0,00"
                className="w-full rounded-lg border border-outline-variant/30 bg-surface px-space-md py-space-sm text-body-md text-on-surface outline-none focus:ring-0"
              />
            </Field>
            {!isCredit && (
              <Field label="Saldo Atual (Fatura)">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={balance}
                  onChange={(event) => setBalance(event.target.value)}
                  placeholder="0,00"
                  className="w-full rounded-lg border border-outline-variant/30 bg-surface px-space-md py-space-sm text-body-md text-on-surface outline-none focus:ring-0"
                />
              </Field>
            )}
          </div>

          <div className="grid grid-cols-2 gap-space-md">
            <Field label="Dia de Fechamento">
              <select
                required
                value={closingDay}
                onChange={(event) => setClosingDay(event.target.value)}
                className="w-full rounded-lg border border-outline-variant/30 bg-surface px-space-md py-space-sm text-body-md text-on-surface outline-none focus:ring-0 md:cursor-pointer"
              >
                <option value="" disabled>
                  Selecione
                </option>
                {DAYS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Dia de Vencimento">
              <select
                required
                value={dueDay}
                onChange={(event) => setDueDay(event.target.value)}
                className="w-full rounded-lg border border-outline-variant/30 bg-surface px-space-md py-space-sm text-body-md text-on-surface outline-none focus:ring-0 md:cursor-pointer"
              >
                <option value="" disabled>
                  Selecione
                </option>
                {DAYS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="flex gap-space-md rounded-xl border border-secondary-container bg-secondary-container/30 p-space-md">
            <span className="material-symbols-outlined shrink-0 text-secondary">lightbulb</span>
            <p className="text-body-md text-on-surface-variant">
              <span className="font-medium text-on-surface">Dica de Gestão: </span>
              Recomendamos deixar pelo menos 7 dias de diferença entre o fechamento e o vencimento da
              fatura.
            </p>
          </div>

          {errorMessage && (
            <p className="rounded-lg bg-error/10 px-space-md py-space-sm text-body-md text-error">
              {errorMessage}
            </p>
          )}

          <div className="flex justify-end gap-space-sm border-t border-outline-variant/30 pt-space-md">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-outline-variant/30 bg-surface px-space-lg py-space-sm text-body-lg font-medium text-on-surface transition-colors hover:bg-surface-container md:cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-space-xs rounded-lg bg-primary px-space-md py-space-sm text-body-lg font-medium text-on-primary shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60 md:cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              {submitting ? "Salvando..." : "Salvar Cartão"}
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
      <span className="text-label-md font-medium text-on-surface">{label}</span>
      {children}
    </label>
  );
}
