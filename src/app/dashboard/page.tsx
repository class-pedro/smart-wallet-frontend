import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata: Metadata = {
  title: "Dashboard | Smart Wallet",
  description: "Visão geral das suas despesas.",
};

export default function DashboardPage() {
  return <DashboardView />;
}
