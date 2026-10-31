import { performance } from 'node:perf_hooks';
import { writeFile } from 'node:fs/promises';
import request from 'supertest';
import { db } from '../src/infra/db.js';
import { app } from '../src/app.js';
import { signSession } from '../src/modules/auth/service.js';
const user = await db.user.create({
  data: {
    name: 'Benchmark',
    email: `benchmark-${Date.now()}@example.test`,
    passwordHash: 'not-a-login-account',
    role: 'ADMIN',
  },
});
const cookie = `session=${signSession(user)}`;
try {
  await db.$executeRawUnsafe('ANALYZE');
  const results = [];
  for (const path of [
    '/api/customers',
    '/api/subscriptions',
    '/api/invoices',
    '/api/invoices/overdue',
    '/api/payments',
    '/api/reports/summary',
    '/api/reports/subscriptions',
    '/api/reports/invoices',
    '/api/reports/payments',
  ]) {
    const durations = [];
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      const res = await request(app).get(path).set('Cookie', cookie);
      if (res.status !== 200) throw Error(`Benchmark ${path}: ${res.status}`);
      durations.push(Math.round((performance.now() - start) * 100) / 100);
    }
    results.push({
      path,
      firstMs: durations[0],
      maxMs: Math.max(...durations),
      meanMs: Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 100) / 100,
    });
  }
  const counts = {
    customers: await db.customer.count(),
    subscriptions: await db.subscription.count(),
    invoices: await db.invoice.count(),
    payments: await db.payment.count(),
  };
  const overduePlan = await db.$queryRawUnsafe(
    'EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT id FROM "Invoice" WHERE status = \'CONFIRMED\' AND "dueDate" < CURRENT_DATE AND "amountPaid" < total ORDER BY "dueDate" LIMIT 25',
  );
  const activePlan = await db.$queryRawUnsafe(
    'EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT count(*) FROM "Subscription" WHERE status = \'ACTIVE\'',
  );
  const summary = (await request(app).get('/api/reports/summary').set('Cookie', cookie)).body.data;
  if (
    summary.activeSubscriptions !== 5000 ||
    summary.revenue !== '1000000.00' ||
    summary.outstanding !== '500000.00' ||
    summary.overdueCount !== 2500
  )
    throw Error(`Summary does not match known fixture totals: ${JSON.stringify(summary)}`);
  const result = {
    measuredAt: new Date().toISOString(),
    environment:
      'Local Windows, embedded PostgreSQL; HTTP via supertest, no hosted network or cold start included',
    counts,
    summary,
    results,
    overduePlan,
    activePlan,
  };
  await writeFile('docs/local-benchmark.json', JSON.stringify(result, null, 2) + '\n');
  console.info(JSON.stringify({ counts, summary, results }, null, 2));
} finally {
  await db.user.delete({ where: { id: user.id } });
  await db.$disconnect();
}
