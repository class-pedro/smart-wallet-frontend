'use client';

import { MonthCarousel } from '@/components/Dashboard/components/MonthCarousel';
import { useDashboard } from './hooks/useDashboars';
import ExpensesTable from './components/ExpensesTable';
import AddExpenseModal from './components/AddExpenseModal';
import { Plus } from 'lucide-react';

export default function Dashboard() {
  const { dashboard, handleChangeMonth, year, offset, left, center, right } =
    useDashboard();

  return (
    <>
      {dashboard && (
        <main className='bg-base-200 w-full h-full flex flex-col items-center gap-4 p-6 rounded shadow-md'>
          <MonthCarousel
            handleChangeMonth={handleChangeMonth}
            year={year}
            offset={offset}
            left={left}
            center={center}
            right={right}
          />
          <button
            className='bg-green-400 btn btn-lg btn-circle fixed bottom-5 right-5 md:hidden'
            onClick={() =>
              (
                document.getElementById('my_modal_1') as HTMLDialogElement
              ).showModal()
            }
          >
            <Plus />
          </button>
          <button
            className='hidden bg-green-400 w-full h-10 text-white font-semibold rounded cursor-pointer hover:opacity-70 md:flex gap-2 justify-center items-center'
            onClick={() =>
              (
                document.getElementById('my_modal_1') as HTMLDialogElement
              ).showModal()
            }
          >
            <Plus />
            Nova Despesa
          </button>
          <AddExpenseModal />
          <div className='stats stats-vertical w-full md:stats-horizontal shadow'>
            <div className='stat'>
              <div className='stat-title text-sm text-red-300'>Gastos</div>
              <div className='stat-value'>R$ {dashboard.total.toFixed(2)}</div>
            </div>
            {/* TO DO: Implementar ganhos e saldo no dashboard pra ajustar a opacidade dos stats abaixo */}
            <div className='stat opacity-50'>
              <div className='stat-title text-sm text-green-300'>Ganhos</div>
              <div className='stat-value'>R$ {dashboard.total.toFixed(2)}</div>
            </div>
            {/* TO DO: Implementar ganhos e saldo no dashboard pra ajustar a opacidade dos stats abaixo */}
            <div className='stat opacity-50'>
              <div className='stat-title text-sm text-blue-300'>Saldo</div>
              <div className='stat-value'>R$ {dashboard.total.toFixed(2)}</div>
            </div>
          </div>
          <ExpensesTable data={dashboard.expenses} />
        </main>
      )}
    </>
  );
}
