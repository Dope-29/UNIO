import { Decimal } from 'decimal.js';
import { assert } from '../shared/errors.js';
Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP });
export type PercentageBasis = 'ORIGINAL' | 'REMAINING';
export interface PriceLine {
  productId: string;
  description: string;
  quantity: number;
  unitPrice: string;
  taxRate: string;
}
export interface PriceDiscount {
  id: string;
  type: 'FIXED' | 'PERCENT';
  scope: 'PRODUCT' | 'SUBSCRIPTION';
  value: string;
  productIds: string[];
  minPurchase?: string | null;
  minQuantity?: number | null;
  startDate: Date;
  endDate: Date;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}
const cents = (value: Decimal.Value) =>
  new Decimal(value).mul(100).toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber();
const money = (value: number) => new Decimal(value).div(100).toFixed(2);
// Allocate whole cents proportionally; largest remainders break ties in input order.
export function allocateCents(amount: number, weights: number[], caps = weights): number[] {
  const result = weights.map(() => 0);
  let remaining = Math.min(
    amount,
    caps.reduce((s, x) => s + x, 0),
  );
  while (remaining > 0) {
    const eligible = weights.map((_, i) => i).filter((i) => caps[i] > result[i] && weights[i] > 0);
    if (!eligible.length) break;
    const weight = eligible.reduce((s, i) => s + weights[i], 0);
    const shares = eligible.map((i) => ({
      i,
      exact: new Decimal(remaining).mul(weights[i]).div(weight),
    }));
    let assigned = 0;
    for (const { i, exact } of shares) {
      const n = Math.min(exact.floor().toNumber(), caps[i] - result[i]);
      result[i] += n;
      assigned += n;
    }
    remaining -= assigned;
    if (!remaining) break;
    shares.sort(
      (a, b) => b.exact.minus(b.exact.floor()).cmp(a.exact.minus(a.exact.floor())) || a.i - b.i,
    );
    for (const { i } of shares) {
      if (remaining && result[i] < caps[i]) {
        result[i]++;
        remaining--;
        assigned++;
      }
    }
    if (!assigned) break;
  }
  return result;
}
export function priceInvoice(
  input: PriceLine[],
  discounts: PriceDiscount[],
  today: Date,
  percentageBasis: PercentageBasis,
) {
  assert(input.length > 0, 400, 'LINES_REQUIRED', 'An invoice requires lines');
  const lines = input.map((l) => {
    assert(
      Number.isSafeInteger(l.quantity) &&
        l.quantity > 0 &&
        new Decimal(l.unitPrice).gte(0) &&
        new Decimal(l.taxRate).gte(0) &&
        new Decimal(l.taxRate).lte(100),
      400,
      'INVALID_PRICING',
      'Invalid quantity, price or tax',
    );
    const base = cents(new Decimal(l.unitPrice).mul(l.quantity));
    assert(Number.isSafeInteger(base), 400, 'AMOUNT_TOO_LARGE', 'Line amount is too large');
    return { ...l, base, discount: 0 };
  });
  const appliedDiscounts: { id: string; amount: string }[] = [];
  const ordered = discounts
    .filter(
      (d) => d.isActive && today >= d.startDate && today <= d.endDate && d.usedCount < d.usageLimit,
    )
    .sort(
      (a, b) =>
        (a.scope === b.scope ? 0 : a.scope === 'PRODUCT' ? -1 : 1) || a.id.localeCompare(b.id),
    );
  for (const d of ordered) {
    const indices = lines
      .map((_, i) => i)
      .filter((i) => d.scope === 'SUBSCRIPTION' || d.productIds.includes(lines[i].productId));
    const subtotal = indices.reduce((s, i) => s + lines[i].base, 0);
    const quantity = indices.reduce((s, i) => s + lines[i].quantity, 0);
    if (
      !subtotal ||
      (d.minPurchase != null && subtotal < cents(d.minPurchase)) ||
      (d.minQuantity != null && quantity < d.minQuantity)
    )
      continue;
    const caps = indices.map((i) => lines[i].base - lines[i].discount);
    const allocations =
      d.type === 'FIXED'
        ? allocateCents(
            cents(d.value),
            indices.map((i) => lines[i].base),
            caps,
          )
        : indices.map((i, j) =>
            Math.min(
              caps[j],
              new Decimal(percentageBasis === 'ORIGINAL' ? lines[i].base : caps[j])
                .mul(d.value)
                .div(100)
                .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
                .toNumber(),
            ),
          );
    const applied = allocations.reduce((s, n) => s + n, 0);
    if (!applied) continue;
    indices.forEach((i, j) => {
      lines[i].discount += allocations[j];
    });
    appliedDiscounts.push({ id: d.id, amount: money(applied) });
  }
  const snapshots = lines.map((l) => {
    const tax = new Decimal(l.base - l.discount)
      .mul(l.taxRate)
      .div(100)
      .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
      .toNumber();
    return {
      description: l.description,
      quantity: l.quantity,
      unitPrice: new Decimal(l.unitPrice).toFixed(2),
      discountAmount: money(l.discount),
      taxRate: new Decimal(l.taxRate).toFixed(2),
      taxAmount: money(tax),
      lineTotal: money(l.base - l.discount + tax),
    };
  });
  const subtotal = lines.reduce((s, l) => s + l.base, 0),
    discountTotal = lines.reduce((s, l) => s + l.discount, 0),
    taxTotal = snapshots.reduce((s, l) => s + cents(l.taxAmount), 0);
  const total = subtotal - discountTotal + taxTotal;
  assert(
    total <= 999999999999,
    400,
    'AMOUNT_TOO_LARGE',
    'Invoice exceeds supported monetary range',
  );
  return {
    header: {
      subtotal: money(subtotal),
      discountTotal: money(discountTotal),
      taxTotal: money(taxTotal),
      total: money(total),
    },
    lines: snapshots,
    appliedDiscounts,
  };
}
