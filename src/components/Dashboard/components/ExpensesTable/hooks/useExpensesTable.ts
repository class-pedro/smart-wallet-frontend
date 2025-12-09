export function useExpensesTable() {
  const columns = [
    { key: 'dashboardExpenseDescription', label: 'Descrição' },
    { key: 'dashboardExpenseCost', label: 'Valor' },
  ];

  return { columns };
}
