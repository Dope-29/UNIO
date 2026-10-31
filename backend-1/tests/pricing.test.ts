import { describe, it, expect } from 'vitest';
import {
  allocateCents,
  priceInvoice,
  type PriceDiscount,
  type PriceLine,
} from '../src/services/pricing.service.js';
const now = new Date('2026-10-31T12:00:00Z');
const line: PriceLine = {
  productId: 'p',
  description: 'Product',
  quantity: 1,
  unitPrice: '100.00',
  taxRate: '18',
};
const rule: PriceDiscount = {
  id: 'd',
  type: 'PERCENT',
  scope: 'PRODUCT',
  value: '10',
  productIds: ['p'],
  startDate: new Date('2026-01-01'),
  endDate: new Date('2026-12-31'),
  usageLimit: 2,
  usedCount: 0,
  isActive: true,
};
const price = (lines = [line], discounts = [rule]) =>
  priceInvoice(lines, discounts, now, 'ORIGINAL');
describe('Invoice pricing', () => {
  it('applies percentage before tax', () =>
    expect(price().header).toEqual({
      subtotal: '100.00',
      discountTotal: '10.00',
      taxTotal: '16.20',
      total: '106.20',
    }));
  it('allocates a fixed rule once across matching lines', () => {
    const out = price(
      [line, { ...line, unitPrice: '200.00' }],
      [{ ...rule, type: 'FIXED', value: '30' }],
    );
    expect(out.lines.map((l) => l.discountAmount)).toEqual(['10.00', '20.00']);
    expect(out.appliedDiscounts).toEqual([{ id: 'd', amount: '30.00' }]);
  });
  it('allocates residual cents deterministically', () =>
    expect(allocateCents(2, [1, 1, 1])).toEqual([1, 1, 0]));
  it('redistributes capped allocations without losing cents', () =>
    expect(allocateCents(50, [100, 100], [10, 100])).toEqual([10, 40]));
  it('checks minimum quantity only in matching products', () =>
    expect(
      price([line, { ...line, productId: 'other', quantity: 10 }], [{ ...rule, minQuantity: 2 }])
        .header.discountTotal,
    ).toBe('0.00'));
  it('checks minimum purchase against scope', () =>
    expect(
      price(
        [line, { ...line, productId: 'other', unitPrice: '1000' }],
        [{ ...rule, minPurchase: '200' }],
      ).header.discountTotal,
    ).toBe('0.00'));
  it.each([
    { endDate: new Date('2025-01-01') },
    { startDate: new Date('2027-01-01') },
    { usedCount: 2 },
    { isActive: false },
  ])('ignores ineligible discount %j', (change) =>
    expect(price([line], [{ ...rule, ...change }]).header.discountTotal).toBe('0.00'),
  );
  it('runs product discounts before subscription discounts', () => {
    const out = priceInvoice(
      [line],
      [
        { ...rule, id: 'a', scope: 'SUBSCRIPTION', value: '10' },
        { ...rule, id: 'z', type: 'FIXED', value: '20' },
      ],
      now,
      'REMAINING',
    );
    expect(out.header.discountTotal).toBe('28.00');
    expect(out.appliedDiscounts.map((d) => d.id)).toEqual(['z', 'a']);
  });
  it('supports explicit original versus remaining percentage basis', () => {
    const discounts = [rule, { ...rule, id: 'second' }];
    expect(priceInvoice([line], discounts, now, 'ORIGINAL').header.discountTotal).toBe('20.00');
    expect(priceInvoice([line], discounts, now, 'REMAINING').header.discountTotal).toBe('19.00');
  });
  it('never discounts below zero or counts a zero-value application', () => {
    const out = price(
      [line],
      [
        { ...rule, type: 'FIXED', value: '500' },
        { ...rule, id: 'z' },
      ],
    );
    expect(out.header.total).toBe('0.00');
    expect(out.lines[0].taxAmount).toBe('0.00');
    expect(out.appliedDiscounts).toHaveLength(1);
  });
  it('rounds tax half-up at line level', () =>
    expect(price([{ ...line, unitPrice: '0.05', taxRate: '10' }], []).header.taxTotal).toBe(
      '0.01',
    ));
  it('has no binary floating-point money drift', () =>
    expect(
      price([{ ...line, unitPrice: '0.10', quantity: 3, taxRate: '0' }], []).header.total,
    ).toBe('0.30'));
  it('preserves accounting identities over varying allocations', () => {
    for (let cents = 1; cents < 500; cents++) {
      const allocation = allocateCents(cents, [101, 202, 303]);
      expect(allocation.reduce((s, n) => s + n, 0)).toBe(cents);
      allocation.forEach((n, i) => expect(n).toBeLessThanOrEqual([101, 202, 303][i]));
    }
  });
});
