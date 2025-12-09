export function formatCurrency(raw: string, currency?: string) {
  const numbers = raw.replace(/\D/g, '');
  const cents = Number.parseInt(numbers, 10) / 100;
  const result = cents.toLocaleString('pt-BR', {
    style: 'currency',
    currency: currency ?? 'BRL',
  });

  return result;
}
