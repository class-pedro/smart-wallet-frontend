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

const MONTH_ABBR = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

/**
 * The cards-to-input endpoint only returns id/name (it's meant for select
 * inputs elsewhere). There's no backend endpoint yet for the financial
 * details the "Meus Cartões" screen shows, so those fields are filled in
 * from a small set of mock templates until that endpoint exists.
 */
const MOCK_TEMPLATES: Array<{
  creditLimit: number;
  currentInvoice: number;
  dueDateDay: number;
  status: CardStatus;
}> = [
  { creditLimit: 10000, currentInvoice: 4250, dueDateDay: 15, status: "aberta" },
  { creditLimit: 35000, currentInvoice: 12890.5, dueDateDay: 5, status: "fechada" },
  { creditLimit: 8000, currentInvoice: 3120.75, dueDateDay: 22, status: "paga" },
  { creditLimit: 15000, currentInvoice: 2100, dueDateDay: 10, status: "aberta" },
];

export function withMockFinancials(cards: CardOption[]): CreditCard[] {
  const now = new Date();
  return cards.map((card, index) => {
    const template = MOCK_TEMPLATES[index % MOCK_TEMPLATES.length];
    return {
      ...card,
      creditLimit: template.creditLimit,
      currentInvoice: template.currentInvoice,
      dueDateLabel: `${template.dueDateDay} ${MONTH_ABBR[now.getMonth()]}`,
      status: template.status,
    };
  });
}
