export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1)$2-$3');
  } else {
    return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1)$2-$3');
  }
}
