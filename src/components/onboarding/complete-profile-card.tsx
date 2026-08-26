"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { completeProfile, getStoredToken } from "@/lib/auth";
import { ShieldAlertIcon, UserIcon } from "@/components/login/icons";

type FormState = "idle" | "submitting" | "error";

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatCellphone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

export function CompleteProfileCard() {
  const [cpf, setCpf] = useState("");
  const [cellphone, setCellphone] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!getStoredToken()) {
      router.replace("/login");
    }
  }, [router]);

  const cpfDigits = cpf.replace(/\D/g, "");
  const cellphoneDigits = cellphone.replace(/\D/g, "");
  const isValid = cpfDigits.length === 11 && cellphoneDigits.length === 11;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!isValid || state === "submitting") return;

    setState("submitting");
    setErrorMessage(null);

    try {
      await completeProfile({ cpf: cpfDigits, cellphone: cellphoneDigits });
      router.push("/dashboard");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar seus dados. Por favor, tente novamente."
      );
      setState("error");
    }
  }

  return (
    <div className="relative flex w-full flex-col gap-6 overflow-hidden rounded-md border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-surface-container-lowest"
      />

      <div className="flex flex-col items-center gap-2">
        <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
          <UserIcon className="h-9 w-9 text-on-primary" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-on-surface">
          Complete seu perfil
        </h2>
        <p className="mx-auto max-w-70 text-sm leading-relaxed text-on-surface-variant">
          Precisamos de mais alguns dados para criar sua carteira financeira.
        </p>
      </div>

      {state === "error" && errorMessage && (
        <div className="flex items-center gap-2 rounded-md bg-error-container p-3 text-left text-sm text-on-error-container">
          <ShieldAlertIcon className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-on-surface-variant">CPF</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(event) => setCpf(formatCpf(event.target.value))}
            disabled={state === "submitting"}
            className="h-12 rounded border border-outline-variant bg-surface-container-lowest px-4 text-base text-on-surface outline-none transition-colors focus:border-primary disabled:opacity-50"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-on-surface-variant">Celular</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="(00) 00000-0000"
            value={cellphone}
            onChange={(event) => setCellphone(formatCellphone(event.target.value))}
            disabled={state === "submitting"}
            className="h-12 rounded border border-outline-variant bg-surface-container-lowest px-4 text-base text-on-surface outline-none transition-colors focus:border-primary disabled:opacity-50"
          />
        </label>

        <button
          type="submit"
          disabled={!isValid || state === "submitting"}
          className="mt-2 flex h-12 w-full items-center justify-center rounded bg-primary text-base font-medium text-on-primary transition-opacity disabled:cursor-not-allowed disabled:opacity-50 md:cursor-pointer"
        >
          {state === "submitting" ? "Salvando..." : "Continuar"}
        </button>
      </form>
    </div>
  );
}
