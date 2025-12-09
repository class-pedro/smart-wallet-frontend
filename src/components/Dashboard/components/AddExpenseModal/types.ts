export type ExpenseFormData = {
  description: string;
  cost: string | number;
  paymentType: 'credit' | 'debit' | 'money';
  paymentMethod: 'payInFull' | 'installment' | 'recurrent';
  paymentDate: string | null;
  purchaseDate: string;
  installments: number | null;
  status: 'pending';
  walletId: string | null;
  cardId: string | null;
};
