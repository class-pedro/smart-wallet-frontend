import type { Metadata } from "next";
import { CardsView } from "@/components/cards/cards-view";

export const metadata: Metadata = {
  title: "Cartões | Smart Wallet",
  description: "Gerencie seus limites e faturas.",
};

export default function CardsPage() {
  return <CardsView />;
}
