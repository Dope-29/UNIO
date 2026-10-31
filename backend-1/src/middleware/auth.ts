import type { RequestHandler } from 'express';
import type { Role } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { db } from '../infra/db.js';
import { env } from '../config/env.js';
import { AppError, assert } from '../shared/errors.js';
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: Role; customerId: string | null };
    }
  }
}
export const authenticate: RequestHandler = async (req, _res, next) => {
  const token = req.cookies?.session;
  assert(token, 401, 'UNAUTHENTICATED', 'Login required');
  let payload: jwt.JwtPayload;
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
    if (typeof decoded === 'string') throw Error();
    payload = decoded;
  } catch {
    throw new AppError(401, 'UNAUTHENTICATED', 'Session expired or invalid');
  }
  assert(typeof payload.sub === 'string', 401, 'UNAUTHENTICATED', 'Invalid session');
  const user = await db.user.findUnique({
    where: { id: payload.sub },
    include: { customer: { select: { id: true } } },
  });
  assert(
    user?.isActive && user.sessionVersion === payload.version,
    401,
    'UNAUTHENTICATED',
    'Session expired or account inactive',
  );
  req.user = { id: user.id, role: user.role, customerId: user.customer?.id ?? null };
  next();
};
export const requireRole =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    assert(
      req.user && roles.includes(req.user.role),
      403,
      'FORBIDDEN',
      'You do not have permission',
    );
    next();
  };
export function customerScope(req: Express.Request) {
  assert(req.user?.customerId, 403, 'FORBIDDEN', 'Customer account required');
  return req.user.customerId;
}
