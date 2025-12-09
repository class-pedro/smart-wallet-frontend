export type DashboardExpense = {
  dashboardExpenseId: string;
  dashboardExpenseDescription: string;
  dashboardExpenseCost: number;
};

export type Dashboard = {
  total: number;
  expenses: DashboardExpense[];
};
