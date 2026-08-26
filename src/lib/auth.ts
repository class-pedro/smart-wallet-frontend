import type {
  CredentialResponse,
  GsiButtonConfiguration,
  PromptMomentNotification,
} from "./google-identity";

export class AuthError extends Error {}

/**
 * Thrown when Google's One Tap prompt could not be shown (e.g. the browser
 * blocked it, the user dismissed it too recently, or FedCM is unavailable).
 * The caller should fall back to the visible Google button instead of
 * treating this as a hard failure.
 */
export class GoogleOneTapUnavailableError extends AuthError {}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";
const GOOGLE_AUTH_ENDPOINT = `${API_URL}/auth/google`;
const COMPLETE_PROFILE_ENDPOINT = `${API_URL}/auth/complete-profile`;
const TOKEN_STORAGE_KEY = "smart-wallet:token";

/** Readable by the proxy (route protection) and the dashboard (walletId), so it can't be httpOnly. */
export const TOKEN_COOKIE_NAME = "smart_wallet_token";
export const WALLET_ID_COOKIE_NAME = "smart_wallet_wallet_id";
const COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

const GENERIC_ERROR_MESSAGE =
  "Não foi possível completar a autenticação. Por favor, tente novamente.";

type LoginResponse = { access_token: string };

type AppTokenClaims = {
  profileComplete: boolean;
  walletId?: string;
};

type SignInResult = { profileComplete: boolean };

let initialized = false;
let pendingResolve: ((result: SignInResult) => void) | null = null;
let pendingReject: ((reason: unknown) => void) | null = null;

function settlePending(action: "resolve" | "reject", value?: SignInResult | unknown) {
  const resolve = pendingResolve;
  const reject = pendingReject;
  pendingResolve = null;
  pendingReject = null;
  if (action === "resolve") resolve?.(value as SignInResult);
  else reject?.(value);
}

function decodeTokenClaims(token: string): AppTokenClaims {
  const payload = token.split(".")[1];
  if (!payload) {
    throw new AuthError(GENERIC_ERROR_MESSAGE);
  }

  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

  try {
    return JSON.parse(atob(padded));
  } catch {
    throw new AuthError(GENERIC_ERROR_MESSAGE);
  }
}

function setCookie(name: string, value: string) {
  const secure = window.location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax${secure}`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function storeAccessToken(token: string): AppTokenClaims {
  const claims = decodeTokenClaims(token);
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  setCookie(TOKEN_COOKIE_NAME, token);
  if (claims.walletId) {
    setCookie(WALLET_ID_COOKIE_NAME, claims.walletId);
  }
  return claims;
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data?.message === "string") return data.message;
  } catch {
    // response had no JSON body — fall through to the generic message
  }
  return GENERIC_ERROR_MESSAGE;
}

async function exchangeCredentialForSession(response: CredentialResponse) {
  try {
    const apiResponse = await fetch(GOOGLE_AUTH_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: response.credential }),
    });

    if (!apiResponse.ok) {
      throw new AuthError(await extractErrorMessage(apiResponse));
    }

    const data: LoginResponse = await apiResponse.json();
    const claims = storeAccessToken(data.access_token);
    settlePending("resolve", { profileComplete: claims.profileComplete });
  } catch (error) {
    settlePending("reject", error instanceof AuthError ? error : new AuthError(GENERIC_ERROR_MESSAGE));
  }
}

function initializeGoogleIdentity() {
  if (initialized) return;

  if (typeof window === "undefined" || !window.google) {
    throw new AuthError(
      "Serviço de autenticação do Google ainda não carregou. Tente novamente em instantes."
    );
  }

  if (!GOOGLE_CLIENT_ID) {
    throw new AuthError(
      "Login com Google não está configurado (NEXT_PUBLIC_GOOGLE_CLIENT_ID ausente)."
    );
  }

  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: exchangeCredentialForSession,
  });
  initialized = true;
}

/**
 * Triggers Google's One Tap credential flow. Resolves once the backend has
 * exchanged the Google ID token for an app session token, telling the caller
 * whether the user still needs to complete their profile (CPF/celular).
 * Rejects with GoogleOneTapUnavailableError if One Tap couldn't be displayed
 * at all, so the caller can fall back to rendering Google's own button.
 */
export function signInWithGoogle(): Promise<SignInResult> {
  return new Promise((resolve, reject) => {
    try {
      initializeGoogleIdentity();
    } catch (error) {
      reject(error);
      return;
    }

    pendingResolve = resolve;
    pendingReject = reject;

    window.google!.accounts.id.prompt((notification: PromptMomentNotification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        settlePending("reject", new GoogleOneTapUnavailableError());
      }
    });
  });
}

/**
 * Renders Google's own "Sign in with Google" button into `container`. Used
 * as a fallback when One Tap can't be shown (see GoogleOneTapUnavailableError).
 */
export function renderFallbackButton(
  container: HTMLElement,
  options?: GsiButtonConfiguration
): void {
  initializeGoogleIdentity();
  window.google!.accounts.id.renderButton(container, {
    type: "standard",
    theme: "outline",
    size: "large",
    text: "continue_with",
    shape: "rectangular",
    width: "296",
    ...options,
  });
}

/**
 * Submits the CPF/celular collected after a first-time Google sign-in.
 * Replaces the stored token with the one returned by the backend, which now
 * carries the created walletId.
 */
export async function completeProfile(data: { cpf: string; cellphone: string }): Promise<void> {
  const token = getStoredToken();
  if (!token) {
    throw new AuthError(GENERIC_ERROR_MESSAGE);
  }

  const response = await fetch(COMPLETE_PROFILE_ENDPOINT, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new AuthError(await extractErrorMessage(response));
  }

  const result: LoginResponse = await response.json();
  storeAccessToken(result.access_token);
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

/** The wallet id the backend embeds in the access token, read from the cookie set at login. */
export function getWalletId(): string | null {
  return getCookie(WALLET_ID_COOKIE_NAME);
}

export function signOut(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  deleteCookie(TOKEN_COOKIE_NAME);
  deleteCookie(WALLET_ID_COOKIE_NAME);
  window.google?.accounts.id.disableAutoSelect();
}
