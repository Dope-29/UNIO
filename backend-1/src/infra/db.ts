import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from '../config/env.js';
export const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: env.SUPABASE_DATABASE_URL }),
});
// Serializable isolation protects shared discount usage, balances, state transitions and counters.
// Retry the entire transaction on contention; external effects stay outside this callback.
export async function transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await db.$transaction(fn, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 10000,
        timeout: 20000,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === 'P2034' || error.code === 'P2002') &&
        attempt < 4
      ) {
        await new Promise((resolve) => setTimeout(resolve, 25 * 2 ** attempt + Math.random() * 30));
        continue;
      }
      throw error;
    }
  }
}
