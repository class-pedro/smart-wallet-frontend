export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length === 0) return '';

  let formatted = '';

  if (digits.length < 3) {
    formatted = digits.replace(/(\d{0,2})/, (_, ddd) => (ddd ? `(${ddd}` : ''));
  } else if (digits.length <= 6) {
    formatted = digits.replace(
      /(\d{2})(\d{0,4})/,
      (_, ddd, part1) => `(${ddd})${part1}`
    );
  } else if (digits.length <= 10) {
    formatted = digits.replace(
      /(\d{2})(\d{4})(\d{0,4})/,
      (_, ddd, part1, part2) => `(${ddd})${part1}${part2 ? '-' + part2 : ''}`
    );
  } else {
    formatted = digits.replace(
      /(\d{2})(\d{5})(\d{0,4})/,
      (_, ddd, part1, part2) => `(${ddd})${part1}${part2 ? '-' + part2 : ''}`
    );
  }

  return formatted;
}
