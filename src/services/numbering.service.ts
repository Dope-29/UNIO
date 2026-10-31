import type { Prisma } from '@prisma/client';
export async function nextNumber(tx: Prisma.TransactionClient, key: 'SUB' | 'INV') {
  const c = await tx.counter.upsert({
    where: { key },
    create: { key, value: 1 },
    update: { value: { increment: 1 } },
  });
  return `${key}-${String(c.value).padStart(4, '0')}`;
}
