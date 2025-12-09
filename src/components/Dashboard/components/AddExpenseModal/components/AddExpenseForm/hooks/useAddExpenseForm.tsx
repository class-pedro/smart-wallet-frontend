import { useEffect, useState } from 'react';
import { OptionItem } from '../../../../../../../types/option';
import { getCardTypes } from '@/services/card.service';
import { useAuth } from '@/hooks/useAuth';
import { ExpenseFormData } from '../../../types';

export function useAddExpenseForm() {
  const { token, walletId } = useAuth();
  const [cardOptions, setCardOptions] = useState<OptionItem[] | null>(null);
  const [formData, setFormData] = useState<ExpenseFormData>({
    description: '',
    cost: '',
    paymentType: 'credit',
    paymentMethod: 'payInFull',
    paymentDate: null,
    purchaseDate: new Date().toISOString().split('T')[0],
    installments: null,
    status: 'pending',
    walletId: null,
    cardId: '',
  });
  const paymentTypeOptions: OptionItem[] = [
    {
      label: 'Tipo de Pagamento',
      value: '',
      disabled: true,
    },
    {
      label: 'Crédito',
      value: 'credit',
    },
    {
      label: 'Débito',
      value: 'debit',
    },
    {
      label: 'Dinheiro',
      value: 'money',
    },
  ];
  const paymentMethodOptions: OptionItem[] = [
    {
      label: 'Forma de Pagamento',
      value: '',
      disabled: true,
    },
    {
      label: 'À Vista',
      value: 'payInFull',
    },
    {
      label: 'Parcelado',
      value: 'installment',
    },
    {
      label: 'Recorrente',
      value: 'recurrent',
    },
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log(formData);
  }

  function handleInputChange(field: keyof ExpenseFormData, value: any) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function buildCardOptions() {
    const cardTypes = await getCardTypes({ token, walletId });
    const options = cardTypes.map(({ id, name }) => ({
      label: name,
      value: id,
    }));

    setCardOptions(options);
  }

  useEffect(() => {
    if (!token || !walletId) return;
    buildCardOptions();
  }, [token, walletId]);

  return {
    cardOptions,
    walletId,
    handleInputChange,
    formData,
    handleSubmit,
    paymentTypeOptions,
    paymentMethodOptions,
  };
}
