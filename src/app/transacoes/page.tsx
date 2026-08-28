import type { Metadata } from "next";
import { TransactionsView } from "@/components/transactions/transactions-view";

export const metadata: Metadata = {
  title: "Transações | Smart Wallet",
  description: "Gerencie suas receitas e despesas.",
};

export default function TransactionsPage() {
  return <TransactionsView />;
}
