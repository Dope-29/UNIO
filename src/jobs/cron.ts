import cron from 'node-cron';
import { env } from '../config/env.js';
import { runBilling } from '../services/billing.service.js';
import { flushMail } from '../services/mail.service.js';
export function startJobs() {
  const tasks = [
    cron.schedule('* * * * *', () => flushMail().catch(console.error), {
      timezone: 'UTC',
      noOverlap: true,
    }),
  ];
  if (env.CRON_ENABLED === 'true')
    tasks.push(
      cron.schedule(
        '0 30 0 * * *',
        () =>
          runBilling()
            .then((r) => {
              console.info('Billing run', r);
            })
            .catch(console.error),
        { timezone: 'UTC', noOverlap: true },
      ),
    );
  return () => tasks.forEach((t) => t.stop());
}
