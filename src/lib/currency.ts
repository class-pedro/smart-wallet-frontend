const BRL_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatBRL(value: number): string {
  return BRL_FORMATTER.format(value);
}

/**
 * Cents-first parsing for masked money inputs: every digit the user types
 * shifts in from the right (typing "1234" means "12,34"), so the field
 * never needs a trailing ",00" appended at submit time.
 */
export function centsFromDigits(rawInput: string): number {
  const digits = rawInput.replace(/\D/g, "");
  return Number(digits || "0");
}
