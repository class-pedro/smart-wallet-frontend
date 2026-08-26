"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signInWithGoogle } from "@/lib/mock-auth";
import { GoogleIcon, ShieldAlertIcon, WalletIcon } from "./icons";

type LoginState = "idle" | "loading" | "error";

export function LoginCard() {
  const [state, setState] = useState<LoginState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorVisible, setErrorVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (state !== "error") return;
    const frame = requestAnimationFrame(() => setErrorVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [state]);

  async function handleGoogleSignIn() {
    setState("loading");
    setErrorMessage(null);
    setErrorVisible(false);

    try {
      await signInWithGoogle();
      router.push("/");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível completar a autenticação. Por favor, tente novamente."
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

      {state === "error" ? (
        <div
          key="error"
          className={`flex flex-col items-center gap-2 rounded-md bg-error-container p-6 text-on-error-container shadow-sm shadow-error/10 transition-all duration-300 ease-out ${
            errorVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-error/10 text-error">
            <ShieldAlertIcon className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-medium tracking-tight">
            Falha na Autenticação
          </h2>
          <p className="mx-auto max-w-70 text-sm opacity-90">
            {errorMessage}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <WalletIcon className="h-9 w-9 text-on-primary" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-on-surface">
            {state === "loading" ? "Autenticando..." : "Bem-vindo ao Smart Wallet"}
          </h2>
          <p className="mx-auto max-w-70 text-sm leading-relaxed text-on-surface-variant">
            {state === "loading"
              ? "Aguarde enquanto conectamos com segurança à sua conta."
              : "Sua gestão financeira inteligente começa aqui. Acesse para gerenciar suas contas, despesas e investimentos."}
          </p>
        </div>
      )}

      {state === "loading" && (
        <div className="flex justify-center py-2" role="status" aria-live="polite">
          <svg
            className="h-10 w-10 animate-spin text-primary"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="sr-only">Autenticando</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={state === "loading"}
        className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded border border-outline-variant bg-surface-container-lowest transition-colors duration-200 hover:enabled:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50 md:cursor-pointer"
      >
        <span
          aria-hidden
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/5 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full"
        />
        <GoogleIcon className="relative z-10 h-5 w-5" />
        <span className="relative z-10 text-base font-medium text-on-surface">
          Continuar com Google
        </span>
      </button>

      {state === "idle" && (
        <p className="mx-auto mt-2 max-w-[240px] text-xs text-on-surface-variant opacity-80">
          Ao continuar, você concorda com nossos{" "}
          <a className="text-primary underline-offset-2 hover:underline" href="#">
            Termos de Serviço
          </a>{" "}
          e{" "}
          <a className="text-primary underline-offset-2 hover:underline" href="#">
            Política de Privacidade
          </a>
          .
        </p>
      )}
    </div>
  );
}
