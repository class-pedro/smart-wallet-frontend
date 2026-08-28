/**
 * No backend endpoint exists yet for transactions — this module returns
 * mocked data shaped like the eventual API response so the screen can be
 * built ahead of the integration.
 */

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
