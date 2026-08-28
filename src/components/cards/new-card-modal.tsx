"use client";

import { useState, type FormEvent } from "react";
import type { CreditCard } from "@/lib/cards";

const MONTH_ABBR = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

type NewCardModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (card: CreditCard) => void;
};

export function NewCardModal({ open, onClose, onCreate }: NewCardModalProps) {
  const [name, setName] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [currentInvoice, setCurrentInvoice] = useState("");
  const [dueDay, setDueDay] = useState("");

  if (!open) return null;

  function resetForm() {
    setName("");
    setCreditLimit("");
    setCurrentInvoice("");
    setDueDay("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name || !creditLimit || !dueDay) return;

    const now = new Date();
    onCreate({
      id: crypto.randomUUID(),
      name,
      creditLimit: Number(creditLimit),
      currentInvoice: Number(currentInvoice) || 0,
      dueDateLabel: `${dueDay.padStart(2, "0")} ${MONTH_ABBR[now.getMonth()]}`,
      status: "aberta",
    });
    resetForm();
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

          <div className="grid grid-cols-2 gap-space-md">
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
            <Field label="Saldo Atual (Fatura)">
              <input
                type="number"
                min="0"
                step="0.01"
                value={currentInvoice}
                onChange={(event) => setCurrentInvoice(event.target.value)}
                placeholder="0,00"
                className="w-full rounded-lg border border-outline-variant/30 bg-surface px-space-md py-space-sm text-body-md text-on-surface outline-none focus:ring-0"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-space-md">
            <Field label="Dia de Fechamento">
              <select
                className="w-full rounded-lg border border-outline-variant/30 bg-surface px-space-md py-space-sm text-body-md text-on-surface outline-none focus:ring-0 md:cursor-pointer"
                defaultValue=""
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
              className="flex items-center gap-space-xs rounded-lg bg-primary px-space-md py-space-sm text-body-lg font-medium text-on-primary shadow-sm transition-colors hover:bg-primary/90 md:cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Salvar Cartão
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
