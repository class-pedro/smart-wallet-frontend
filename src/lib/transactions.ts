import { AuthError, SessionExpiredError, getStoredToken } from "./auth";

/**
 * Listing transactions has no backend endpoint yet — this module returns
 * mocked data shaped like the eventual API response so the screen can be
 * built ahead of the integration. Creating an expense, however, does hit
 * the real `/expenses` endpoint (see `createExpense` below).
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";
const EXPENSES_ENDPOINT = `${API_URL}/expenses`;

const CREATE_EXPENSE_ERROR_MESSAGE =
  "Não foi possível salvar a despesa. Por favor, verifique os dados e tente novamente.";

export type TransactionStatus = "pago" | "pendente" | "recebido";
export type TransactionKind = "despesa" | "receita";

export type Transaction = {
  id: string;
  dateLabel: string;
  description: string;
  paymentLabel: string;
  paymentDetail?: string;
  amount: number;
  kind: TransactionKind;
  status: TransactionStatus;
};

export type TransactionsSummary = {
  currentBalance: number;
  monthExpenses: number;
  monthIncome: number;
};

export type TransactionsData = {
  summary: TransactionsSummary;
  transactions: Transaction[];
};

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    dateLabel: "12 Nov 2023",
    description: "Compra no Supermercado",
    paymentLabel: "Crédito",
    paymentDetail: "Parcelado 1/3",
    amount: 150,
    kind: "despesa",
    status: "pago",
  },
  {
    id: "2",
    dateLabel: "10 Nov 2023",
    description: "Assinatura Streaming",
    paymentLabel: "Crédito",
    paymentDetail: "Recorrente",
    amount: 34.9,
    kind: "despesa",
    status: "pago",
  },
  {
    id: "3",
    dateLabel: "05 Nov 2023",
    description: "Aluguel Mensal",
    paymentLabel: "Débito",
    amount: 2500,
    kind: "despesa",
    status: "pendente",
  },
  {
    id: "4",
    dateLabel: "02 Nov 2023",
    description: "Jantar Restaurante",
    paymentLabel: "Dinheiro",
    amount: 120,
    kind: "despesa",
    status: "pago",
  },
];

const MOCK_SUMMARY: TransactionsSummary = {
  currentBalance: 12450,
  monthExpenses: 3840.9,
  monthIncome: 8500,
};

export function fetchTransactions(): Promise<TransactionsData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ summary: MOCK_SUMMARY, transactions: MOCK_TRANSACTIONS });
    }, 400);
  });
}

/** Mirrors the backend's PaymentTypeEnum (credit|debit|money). */
export type ExpensePaymentType = "credit" | "debit" | "money";
/** Mirrors the backend's PaymentMethodEnum (payInFull|installment|recurrent). */
export type ExpensePaymentMethod = "payInFull" | "installment" | "recurrent";

export type NewExpensePayload = {
  description: string;
  /** The `cost` field the backend expects — despite the name, it's an integer amount of cents. */
  costCents: number;
  paymentType: ExpensePaymentType;
  paymentMethod: ExpensePaymentMethod;
  /** ISO date (YYYY-MM-DD) — sent to the backend as a start-of-day LocalDateTime. */
  purchaseDate: string;
  installments?: number;
  /** Exactly one of walletId/cardId must be set, matching the paymentType. */
  walletId?: string;
  cardId?: string;
};

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data?.message === "string") return data.message;
  } catch {
    // response had no JSON body — fall through to the fallback message
  }
  return CREATE_EXPENSE_ERROR_MESSAGE;
}

export async function createExpense(payload: NewExpensePayload): Promise<void> {
  const token = getStoredToken();
  if (!token) {
    throw new SessionExpiredError(CREATE_EXPENSE_ERROR_MESSAGE);
  }

  let response: Response;
  try {
    response = await fetch(EXPENSES_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        description: payload.description,
        cost: payload.costCents,
        paymentType: payload.paymentType,
        paymentMethod: payload.paymentMethod,
        purchaseDate: `${payload.purchaseDate}T00:00:00`,
        installments: payload.installments,
        walletId: payload.walletId,
        cardId: payload.cardId,
      }),
    });
  } catch {
    throw new AuthError(CREATE_EXPENSE_ERROR_MESSAGE);
  }

  if (response.status === 401) {
    throw new SessionExpiredError(CREATE_EXPENSE_ERROR_MESSAGE);
  }

  if (!response.ok) {
    throw new AuthError(await extractErrorMessage(response));
  }
}
