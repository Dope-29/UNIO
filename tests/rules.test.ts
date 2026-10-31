import { it, expect } from 'vitest';
import { addPeriod } from '../src/shared/dates.js';
import { passwordRule } from '../src/shared/schema.js';
it('clamps month ends while preserving anchor on subsequent periods', () => {
  const jan = new Date('2026-01-31T12:00:00Z');
  const feb = addPeriod(jan, 'MONTHLY', 31);
  expect(feb.toISOString()).toBe('2026-02-28T12:00:00.000Z');
  expect(addPeriod(feb, 'MONTHLY', 31).toISOString()).toBe('2026-03-31T12:00:00.000Z');
});
it('handles leap-year anniversaries', () =>
  expect(addPeriod(new Date('2024-02-29T00:00:00Z'), 'YEARLY').toISOString()).toBe(
    '2025-02-28T00:00:00.000Z',
  ));
it.each(['Abcdef!x', 'abcdefgh!', 'ABCDEFGH!', 'Abcdefghi'])(
  'rejects invalid password %s',
  (password) => expect(passwordRule.safeParse(password).success).toBe(false),
);
it('accepts a valid password without requiring a digit', () =>
  expect(passwordRule.safeParse('Abcdefgh!').success).toBe(true));
