export const CCY: Record<string, string> = { USD: "$", GBP: "£", EUR: "€" };

export function sym(currency: string): string {
  return CCY[currency] ?? currency;
}

export function acct(user: { accountNumber?: string; _id?: string }): string {
  if (user.accountNumber) return user.accountNumber;
  if (user._id) return "SWB-" + user._id.slice(-8).toUpperCase();
  return "";
}

export function displayDate(t: { createdAt: number; backDate?: string }): Date {
  if (t.backDate) return new Date(t.backDate + "T12:00:00");
  return new Date(t.createdAt);
}
