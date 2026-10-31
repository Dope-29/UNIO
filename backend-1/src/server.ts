import { app } from './app.js';
import { env } from './config/env.js';
import { db } from './infra/db.js';
import { startJobs } from './jobs/cron.js';
await db.$connect();
const stopJobs = startJobs();
const server = app.listen(env.PORT, () =>
  console.info(`Brightloop API listening on port ${env.PORT}`),
);
for (const signal of ['SIGINT', 'SIGTERM'])
  process.once(signal, () => {
    stopJobs();
    server.close(() => {
      void db.$disconnect().then(() => process.exit(0));
    });
    setTimeout(() => process.exit(1), 10000).unref();
  });
