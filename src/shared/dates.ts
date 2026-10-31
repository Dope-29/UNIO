export type BillingPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}
export function addPeriod(date: Date, period: BillingPeriod, anchorDay = date.getUTCDate()) {
  if (period === 'DAILY' || period === 'WEEKLY') return addDays(date, period === 'DAILY' ? 1 : 7);
  const d = new Date(date);
  const month = d.getUTCMonth() + (period === 'MONTHLY' ? 1 : 12);
  d.setUTCDate(1);
  d.setUTCMonth(month);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(anchorDay, last));
  return d;
}
export function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}
