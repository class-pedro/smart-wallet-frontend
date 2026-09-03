import { AuthError, SessionExpiredError, getStoredToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";
const EXPENSES_ENDPOINT = `${API_URL}/expenses`;

const GENERIC_ERROR_MESSAGE =
  "Não foi possível buscar suas transações. Por favor, verifique sua conexão e tente novamente.";
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

type TransactionListItemResponse = {
  id: string;
  purchaseDate: string | null;
  description: string;
  paymentType: "credit" | "debit" | "money";
  paymentMethod: "payInFull" | "installment" | "recurrent";
  installmentNumber: number | null;
  installments: number | null;
  amount: number;
  status: string | null;
};

type TransactionsResponse = {
  summary: TransactionsSummary;
  transactions: TransactionListItemResponse[];
};

const PAYMENT_TYPE_LABEL: Record<TransactionListItemResponse["paymentType"], string> = {
  credit: "Crédito",
  debit: "Débito",
  money: "Dinheiro",
};

const MONTH_ABBR = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function formatDateLabel(isoDateTime: string | null): string {
  if (!isoDateTime) return "-";
  const date = new Date(isoDateTime);
  const day = String(date.getDate()).padStart(2, "0");
  return `${day} ${MONTH_ABBR[date.getMonth()]} ${date.getFullYear()}`;
}

function paymentDetailFor(item: TransactionListItemResponse): string | undefined {
  if (item.paymentMethod === "installment" && item.installmentNumber && item.installments) {
    return `Parcelado ${item.installmentNumber}/${item.installments}`;
  }
  if (item.paymentMethod === "recurrent") {
    return "Recorrente";
  }
  return undefined;
}

function statusFor(item: TransactionListItemResponse): TransactionStatus {
  return item.status === "paid" ? "pago" : "pendente";
}

function toTransaction(item: TransactionListItemResponse): Transaction {
  return {
    id: item.id,
    dateLabel: formatDateLabel(item.purchaseDate),
    description: item.description,
    paymentLabel: PAYMENT_TYPE_LABEL[item.paymentType],
    paymentDetail: paymentDetailFor(item),
    amount: item.amount,
    kind: "despesa",
    status: statusFor(item),
  };
}

export async function fetchTransactions(params: { walletId: string }): Promise<TransactionsData> {
  const token = getStoredToken();
  if (!token) {
    throw new SessionExpiredError(GENERIC_ERROR_MESSAGE);
  }

  const url = new URL(EXPENSES_ENDPOINT);
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

  const data: TransactionsResponse = await response.json();

  return {
    summary: data.summary,
    transactions: data.transactions.map(toTransaction),
  };
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
