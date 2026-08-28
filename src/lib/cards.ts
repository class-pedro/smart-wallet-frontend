import { AuthError, getStoredToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";
const CARDS_TO_INPUT_ENDPOINT = `${API_URL}/cards/cards-to-input`;

const GENERIC_ERROR_MESSAGE =
  "Não foi possível buscar seus cartões. Por favor, verifique sua conexão e tente novamente.";

export type CardOption = {
  id: string;
  name: string;
};

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
    throw new AuthError(GENERIC_ERROR_MESSAGE);
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

  if (!response.ok) {
    throw new AuthError(GENERIC_ERROR_MESSAGE);
  }

  return response.json();
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
