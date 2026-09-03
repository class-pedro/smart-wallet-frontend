import { AuthError, SessionExpiredError, getStoredToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";
const CARDS_TO_INPUT_ENDPOINT = `${API_URL}/cards/cards-to-input`;
const CARDS_ENDPOINT = `${API_URL}/cards`;
const CARD_TYPES_ENDPOINT = `${API_URL}/card-types`;

const GENERIC_ERROR_MESSAGE =
  "Não foi possível buscar seus cartões. Por favor, verifique sua conexão e tente novamente.";
const CARD_TYPES_ERROR_MESSAGE =
  "Não foi possível buscar os tipos de cartão. Por favor, verifique sua conexão e tente novamente.";
const CREATE_CARD_ERROR_MESSAGE =
  "Não foi possível criar o cartão. Por favor, verifique os dados e tente novamente.";

export type CardOption = {
  id: string;
  name: string;
};

export type CardType = {
  id: string;
  title: string;
};

export type NewCardPayload = {
  name: string;
  /** Must be null for credit cards — the API rejects a numeric balance in that case. */
  balance: number | null;
  dueDateDay: number;
  closingDateDay: number;
  creditLimit: number;
  cardTypeId: string;
  walletId: string;
};

async function extractErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data?.message === "string") return data.message;
  } catch {
    // response had no JSON body — fall through to the fallback message
  }
  return fallback;
}

export type CardStatus = "aberta" | "fechada" | "paga";

export type CreditCard = CardOption & {
  creditLimit: number;
  currentInvoice: number;
  dueDateLabel: string;
  status: CardStatus;
};

export async function fetchCardsToInput(params: { walletId: string }): Promise<CardOption[]> {
  const token = getStoredToken();
  if (!token) {
    throw new SessionExpiredError(GENERIC_ERROR_MESSAGE);
  }

  const url = new URL(CARDS_TO_INPUT_ENDPOINT);
  url.searchParams.set("walletId", params.walletId);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new AuthError(GENERIC_ERROR_MESSAGE);
  }

  if (response.status === 401) {
    throw new SessionExpiredError(GENERIC_ERROR_MESSAGE);
  }

  if (!response.ok) {
    throw new AuthError(GENERIC_ERROR_MESSAGE);
  }

  return response.json();
}

export async function fetchCardTypes(): Promise<CardType[]> {
  const token = getStoredToken();
  if (!token) {
    throw new AuthError(CARD_TYPES_ERROR_MESSAGE);
  }

  let response: Response;
  try {
    response = await fetch(CARD_TYPES_ENDPOINT, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new AuthError(CARD_TYPES_ERROR_MESSAGE);
  }

  if (!response.ok) {
    throw new AuthError(CARD_TYPES_ERROR_MESSAGE);
  }

  return response.json();
}

export async function fetchCards(params: { walletId: string }): Promise<CreditCard[]> {
  const token = getStoredToken();
  if (!token) {
    throw new SessionExpiredError(GENERIC_ERROR_MESSAGE);
  }

  const url = new URL(CARDS_ENDPOINT);
  url.searchParams.set("walletId", params.walletId);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new AuthError(GENERIC_ERROR_MESSAGE);
  }

  if (response.status === 401) {
    throw new SessionExpiredError(GENERIC_ERROR_MESSAGE);
  }

  if (!response.ok) {
    throw new AuthError(GENERIC_ERROR_MESSAGE);
  }

  return response.json();
}

export async function createCard(payload: NewCardPayload): Promise<void> {
  const token = getStoredToken();
  if (!token) {
    throw new AuthError(CREATE_CARD_ERROR_MESSAGE);
  }

  let response: Response;
  try {
    response = await fetch(CARDS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new AuthError(CREATE_CARD_ERROR_MESSAGE);
  }

  if (!response.ok) {
    throw new AuthError(await extractErrorMessage(response, CREATE_CARD_ERROR_MESSAGE));
  }
}

