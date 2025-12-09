import Table from '@/components/shared/Table';
import { DashboardExpense } from '../../types';
import { useExpensesTable } from './hooks/useExpensesTable';

type ExpensesTableProps = {
  data: DashboardExpense[];
};

export default function ExpensesTable({ data }: ExpensesTableProps) {
  const { columns } = useExpensesTable();

  return <Table data={data} columns={columns} isEnumeratedTable />;
}
