import EmbeddedPostgres from 'embedded-postgres';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
const password = randomBytes(24).toString('hex');
const port = 55439;
const pg = new EmbeddedPostgres({
  databaseDir: resolve('.test-db', `run-${Date.now()}`),
  user: 'postgres',
  password,
  port,
  persistent: true,
  initdbFlags: ['-c', 'shared_buffers=16MB', '-c', 'max_connections=20'],
  postgresFlags: ['-h', '127.0.0.1', '-c', 'shared_buffers=16MB', '-c', 'max_connections=20'],
  onLog: () => {},
  onError: () => {},
});
const databaseUrl = `postgresql://postgres:${password}@127.0.0.1:${port}/brightloop_test`;
const run = (script: string, args: string[]) =>
  new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [script, ...args], {
      stdio: 'inherit',
      windowsHide: true,
      env: {
        ...process.env,
        NODE_ENV: 'test',
        JWT_SECRET: randomBytes(32).toString('hex'),
        CRON_KEY: randomBytes(32).toString('hex'),
        FRONTEND_URL: 'http://localhost:5173',
        DATABASE_URL: databaseUrl,
        DIRECT_URL: databaseUrl,
        TEST_DATABASE_URL: databaseUrl,
        SEED_BULK_CONFIRM: 'development-fixtures',
      },
    });
    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`Command exited ${code}`)),
    );
  });
try {
  await pg.initialise();
  await pg.start();
  await pg.createDatabase('brightloop_test');
  await run('node_modules/prisma/build/index.js', ['migrate', 'deploy']);
  await run('node_modules/vitest/vitest.mjs', ['run']);
  if (process.argv.includes('--benchmark')) {
    await run('node_modules/tsx/dist/cli.mjs', ['prisma/seed-bulk.ts']);
    await run('node_modules/tsx/dist/cli.mjs', ['scripts/benchmark.ts']);
  }
} finally {
  await pg.stop();
}
