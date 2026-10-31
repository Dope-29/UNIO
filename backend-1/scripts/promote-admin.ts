import { email } from '../src/shared/schema.js';
import { db } from '../src/infra/db.js';
import { assert } from '../src/shared/errors.js';

const value = process.argv[2];
assert(value, 400, 'EMAIL_REQUIRED', 'Usage: npm run users:promote-admin -- email@example.com');

const user = await db.user.update({
  where: { email: email.parse(value) },
  data: { role: 'ADMIN', isActive: true, sessionVersion: { increment: 1 } },
  select: { id: true, email: true, role: true },
});

console.info(`Promoted ${user.email} to ${user.role}. Log in again to get a new session.`);
await db.$disconnect();
