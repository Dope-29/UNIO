import request from 'supertest';
import { afterAll, it, expect } from 'vitest';
import { createHmac } from 'node:crypto';
import { app } from '../src/app.js';
import { db } from '../src/infra/db.js';
import { verifyWebhook } from '../src/services/gateway.service.js';
afterAll(() => db.$disconnect());
it('serves a liveness check without database access', async () => {
  const r = await request(app).get('/health');
  expect(r.status).toBe(200);
});
it('rejects unauthenticated access', async () => {
  const r = await request(app).get('/api/invoices');
  expect(r.status).toBe(401);
  expect(r.body.error.code).toBe('UNAUTHENTICATED');
});
it('rejects malformed auth payload before touching database', async () => {
  const r = await request(app)
    .post('/api/auth/signup')
    .send({ name: 'A', email: 'bad', password: 'short' });
  expect(r.status).toBe(400);
  expect(r.body.error.code).toBe('VALIDATION_ERROR');
});
it('rejects role injection on signup', async () => {
  const r = await request(app)
    .post('/api/auth/signup')
    .send({ name: 'A', email: 'a@example.com', password: 'Abcdefgh!', role: 'ADMIN' });
  expect(r.status).toBe(400);
});
it('rejects cross-origin cookie mutations', async () => {
  const r = await request(app)
    .post('/api/auth/login')
    .set('Origin', 'https://attacker.example')
    .send({});
  expect(r.status).toBe(403);
});
it('rejects form submissions', async () => {
  const r = await request(app).post('/api/auth/login').type('form').send({});
  expect(r.status).toBe(415);
});
it('validates raw webhook bytes with constant-time comparison', () => {
  const raw = Buffer.from('{"event":"test"}');
  const signature = createHmac('sha256', 'secret').update(raw).digest('hex');
  expect(() => verifyWebhook(raw, signature, 'secret')).not.toThrow();
  expect(() => verifyWebhook(Buffer.from('{}'), signature, 'secret')).toThrow();
  expect(() => verifyWebhook(raw, 'invalid', 'secret')).toThrow();
});
