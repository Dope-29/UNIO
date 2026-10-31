import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '../../config/env.js';
import { authenticate } from '../../middleware/auth.js';
import { db } from '../../infra/db.js';
import * as schema from './schema.js';
import * as service from './service.js';
export const authRouter = Router();
const limit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMIT', message: 'Too many attempts; try again later' } },
});
const cookie = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production' || env.COOKIE_SAME_SITE === 'none',
  sameSite: env.COOKIE_SAME_SITE,
  path: '/api',
} as const;
authRouter.post('/signup', limit, async (req, res) => {
  const u = await service.signup(schema.signup.parse(req.body));
  res
    .cookie('session', service.signSession(u), { ...cookie, maxAge: 8 * 3600000 })
    .status(201)
    .json({ data: service.safeUser(u) });
});
authRouter.post('/login', limit, async (req, res) => {
  const d = schema.login.parse(req.body);
  const u = await service.login(d.email, d.password);
  res
    .cookie('session', service.signSession(u), { ...cookie, maxAge: 8 * 3600000 })
    .json({ data: service.safeUser(u) });
});
authRouter.post('/logout', authenticate, async (req, res) => {
  await db.user.update({ where: { id: req.user!.id }, data: { sessionVersion: { increment: 1 } } });
  res.clearCookie('session', cookie).status(204).end();
});
authRouter.get('/me', authenticate, async (req, res) => {
  const u = await db.user.findUniqueOrThrow({ where: { id: req.user!.id } });
  res.json({ data: { ...service.safeUser(u), customerId: req.user!.customerId } });
});
authRouter.post('/forgot', limit, async (req, res) => {
  await service.forgot(schema.forgot.parse(req.body).email);
  res.json({ message: 'If the account exists, a reset email will be sent' });
});
authRouter.post('/reset', limit, async (req, res) => {
  const d = schema.reset.parse(req.body);
  await service.reset(d.token, d.password);
  res.clearCookie('session', cookie).json({ message: 'Password reset successfully' });
});
