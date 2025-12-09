'use-client';

import { formatCurrency } from '@/utils/formatCurrency';
import { useAddExpenseForm } from './hooks/useAddExpenseForm';
import InputBox from '@/components/shared/InputBox';

export function AddExpenseForm() {
  const {
    cardOptions,
    walletId,
    handleInputChange,
    formData,
    handleSubmit,
    paymentTypeOptions,
    paymentMethodOptions,
  } = useAddExpenseForm();
  return (
    <form
      method='dialog'
      onSubmit={handleSubmit}
      className='w-full flex flex-col'
    >
      <InputBox
        id='description'
        label='Descrição'
        type='text'
        placeholder='Descreva sua despesa'
        value={formData.description}
        onChange={(e: any) => handleInputChange('description', e.target.value)}
        required
      />

      <InputBox
        id='cost'
        label='Valor'
        type='text'
        placeholder='R$ 0,00'
        value={formData.cost}
        onChange={(e: any) =>
          handleInputChange('cost', formatCurrency(e.target.value))
        }
        required
      />

      <InputBox
        id='paymentType'
        label='Tipo de Pagamento'
        as='select'
        value={formData.paymentType}
        options={paymentTypeOptions}
        onChange={(value: any) => {
          const paymentTypeValue = value.target.value;
          if (paymentTypeValue === 'credit' || paymentTypeValue === 'debit') {
            handleInputChange('walletId', null);
          }

          if (paymentTypeValue === 'money') {
            handleInputChange('cardId', null);
            handleInputChange('walletId', `${walletId}`);
          }
          handleInputChange('paymentType', paymentTypeValue);
        }}
        required
      />

      <InputBox
        id='paymentMethod'
        label='Método de Pagamento'
        as='select'
        value={formData.paymentMethod}
        options={paymentMethodOptions}
        onChange={(value: any) => {
          const paymentMethodValue = value.target.value;
          if (paymentMethodValue !== 'installment') {
            handleInputChange('installments', null);
          }
          handleInputChange('paymentMethod', paymentMethodValue);
        }}
        required
      />

      <InputBox
        id='purchaseDate'
        label='Data da Compra'
        type='date'
        value={formData.purchaseDate}
        onChange={(e: any) => handleInputChange('purchaseDate', e.target.value)}
        required
      />

      <InputBox
        id='paymentDate'
        label='Data da Pagamento'
        type='date'
        value={formData.paymentDate ?? ''}
        onChange={(e: any) => handleInputChange('paymentDate', e.target.value)}
        required
      />

      {formData.paymentMethod === 'installment' && (
        <InputBox
          id='installments'
          label='Parcelas'
          value={formData.installments || ''}
          onChange={(e: any) =>
            handleInputChange(
              'installments',
              Number.parseInt(e.target.value) || null
            )
          }
          required
        />
      )}

      <InputBox
        id='cardId'
        label='Cartão'
        as='select'
        value={formData.cardId ?? ''}
        options={cardOptions ?? undefined}
        onChange={(value: any) => {
          handleInputChange('cardId', value);
          handleInputChange('walletId', null);
        }}
        disabled={formData.paymentType === 'money'}
      />

      <InputBox
        id='walletId'
        label='Carteira'
        as='select'
        value={formData.walletId ?? ''}
        options={cardOptions ?? undefined}
        onChange={(value: any) => {
          handleInputChange('cardId', null);
          handleInputChange('walletId', value);
        }}
        disabled={formData.paymentType !== 'money'}
      />

      <div className='flex flex-col space-y-2 pt-4'>
        <button
          type='submit'
          className='bg-green-400 w-full btn hover:bg-green-500'
        >
          Adicionar Despesa
        </button>
      </div>
    </form>
  );
}
