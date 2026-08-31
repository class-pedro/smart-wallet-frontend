import { AuthError, SessionExpiredError, getStoredToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";
const DASHBOARD_ENDPOINT = `${API_URL}/expenses/dash`;

const GENERIC_ERROR_MESSAGE =
  "Não foi possível buscar as informações financeiras. Por favor, verifique sua conexão e tente novamente.";

export type DashboardExpense = {
  dashboardExpenseId: string;
  dashboardExpenseDescription: string;
  dashboardExpenseCost: number;
};

export type DashboardData = {
  total: number;
  expenses: DashboardExpense[];
};

export async function fetchDashboard(params: {
  walletId: string;
  month: number;
  year: number;
}): Promise<DashboardData> {
  const token = getStoredToken();
  if (!token) {
    throw new SessionExpiredError(GENERIC_ERROR_MESSAGE);
  }

  const url = new URL(DASHBOARD_ENDPOINT);
  url.searchParams.set("walletId", params.walletId);
  url.searchParams.set("month", String(params.month));
  url.searchParams.set("year", String(params.year));

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
