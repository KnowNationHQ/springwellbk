export const CCY: Record<string, string> = { USD: "$", GBP: "£", EUR: "€" };

export function sym(currency: string): string {
  return CCY[currency] ?? currency;
}
