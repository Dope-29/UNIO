import { transaction } from '../../infra/db.js';
import type { z } from 'zod';
import { customerSchema } from './schema.js';
export async function updateCustomer(id: string, data: Partial<z.infer<typeof customerSchema>>) {
  return transaction(async (tx) => {
    const c = await tx.customer.update({ where: { id }, data });
    if (c.userId)
      await tx.user.update({
        where: { id: c.userId },
        data: { email: data.email, name: data.name },
      });
    return c;
  });
}
