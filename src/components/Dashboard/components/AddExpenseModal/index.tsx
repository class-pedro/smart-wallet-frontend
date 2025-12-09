import { AddExpenseForm } from './components/AddExpenseForm';

export default function AddExpenseModal() {
  return (
    <dialog id='my_modal_1' className='modal'>
      <div className='modal-box'>
        <h3 className='font-bold text-lg'>Adicionar Despesa</h3>
        <div className='modal-action flex-col'>
          <AddExpenseForm />
          <form method='dialog' className='w-full'>
            <button className='btn w-full'>Close</button>
          </form>
        </div>
      </div>
    </dialog>
  );
}
