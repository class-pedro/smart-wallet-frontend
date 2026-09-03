"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  GoogleOneTapUnavailableError,
  renderFallbackButton,
  signInWithGoogle,
} from "@/lib/auth";
import { GoogleIcon, ShieldAlertIcon, WalletIcon } from "./icons";

type LoginState = "idle" | "loading" | "error" | "fallback";

const GENERIC_ERROR_MESSAGE =
  "Não foi possível completar a autenticação. Por favor, tente novamente.";

export function LoginCard() {
  const [state, setState] = useState<LoginState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorVisible, setErrorVisible] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const fallbackButtonRef = useRef<HTMLDivElement>(null);
  const fallbackRendered = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (state !== "error") return;
    const frame = requestAnimationFrame(() => setErrorVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [state]);

  useEffect(() => {
    if (!scriptReady || state !== "fallback" || fallbackRendered.current) return;
    if (!fallbackButtonRef.current) return;

    try {
      renderFallbackButton(fallbackButtonRef.current);
      fallbackRendered.current = true;
    } catch (error) {
      const message = error instanceof Error ? error.message : GENERIC_ERROR_MESSAGE;
      queueMicrotask(() => {
        setErrorMessage(message);
        setState("error");
      });
    }
  }, [scriptReady, state]);

  async function handleGoogleSignIn() {
    setState("loading");
    setErrorMessage(null);
    setErrorVisible(false);

    try {
      const { profileComplete } = await signInWithGoogle();
      router.push(profileComplete ? "/dashboard" : "/completar-perfil");
    } catch (error) {
      if (error instanceof GoogleOneTapUnavailableError) {
        setState("fallback");
        return;
      }
      setErrorMessage(error instanceof Error ? error.message : GENERIC_ERROR_MESSAGE);
      setState("error");
    }
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />

      <div className="card relative w-full overflow-hidden border border-base-300 bg-base-100 shadow-xl">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-br from-primary/5 via-transparent to-base-100"
        />
        <div className="card-body items-center gap-6 p-8 text-center">
          {state === "error" ? (
            <div
              key="error"
              role="alert"
              className={`alert alert-error alert-soft flex-col items-center gap-2 py-6 transition-all duration-300 ease-out ${
                errorVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              }`}
            >
              <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-error/10 text-error">
                <ShieldAlertIcon className="h-7 w-7" />
              </div>
              <h2 className="text-title-lg tracking-tight">Falha na Autenticação</h2>
              <p className="mx-auto max-w-70 text-body-md opacity-90">{errorMessage}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-primary-content shadow-lg shadow-primary/20">
                <WalletIcon className="h-7 w-7" />
              </div>
              <h2
                className={
                  state === "idle"
                    ? "text-headline-md tracking-tight text-base-content"
                    : "text-title-lg tracking-tight text-base-content"
                }
              >
                {state === "loading"
                  ? "Autenticando..."
                  : state === "fallback"
                    ? "Confirme com o Google"
                    : "Bem-vindo ao Smart Wallet"}
              </h2>
              <p className="mx-auto max-w-70 text-body-md leading-relaxed text-base-content/60">
                {state === "loading"
                  ? "Aguarde enquanto conectamos com segurança à sua conta."
                  : state === "fallback"
                    ? "Não foi possível abrir a confirmação automática. Use o botão oficial do Google abaixo."
                    : "Sua gestão financeira inteligente começa aqui. Acesse para gerenciar suas contas, despesas e investimentos."}
              </p>
            </div>
          )}

          {state === "loading" && (
            <div className="flex justify-center py-2" role="status" aria-live="polite">
              <span className="loading loading-spinner loading-lg text-primary" />
              <span className="sr-only">Autenticando</span>
            </div>
          )}

          {state === "fallback" ? (
            <div className="flex flex-col items-center gap-3">
              <div ref={fallbackButtonRef} className="flex justify-center" />
              <button
                type="button"
                onClick={() => {
                  fallbackRendered.current = false;
                  setState("idle");
                }}
                className="btn btn-link btn-sm text-label-md text-primary no-underline hover:underline"
              >
                Voltar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={state === "loading"}
              className="btn btn-outline w-full gap-2 text-body-md font-medium"
            >
              <GoogleIcon className="h-5 w-5" />
              Continuar com Google
            </button>
          )}

          {state === "idle" && (
            <p className="mx-auto mt-2 max-w-[240px] text-label-md text-base-content/60">
              Ao continuar, você concorda com nossos{" "}
              <a className="link link-primary" href="#">
                Termos de Serviço
              </a>{" "}
              e{" "}
              <a className="link link-primary" href="#">
                Política de Privacidade
              </a>
              .
            </p>
          )}
        </div>
      </div>
    </>
  );
}
