import bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { db, transaction } from '../../infra/db.js';
import { env } from '../../config/env.js';
import { assert } from '../../shared/errors.js';
import { sendMail } from '../../services/mail.service.js';
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
export const safeUser = (u: { id: string; name: string; email: string; role: string }) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
});
export const signSession = (u: { id: string; sessionVersion: number }) =>
  jwt.sign({ version: u.sessionVersion }, env.JWT_SECRET, {
    subject: u.id,
    expiresIn: '8h',
    algorithm: 'HS256',
  });
export async function signup(data: { name: string; email: string; password: string }) {
  const passwordHash = await bcrypt.hash(data.password, 12);
  return transaction(async (tx) => {
    const existing = await tx.user.findUnique({ where: { email: data.email } });
    assert(!existing, 409, 'ACCOUNT_EXISTS', 'Account already exists');
    const customer = await tx.customer.findUnique({ where: { email: data.email } });
    assert(!customer?.userId, 409, 'ACCOUNT_EXISTS', 'Account already exists');
    const user = await tx.user.create({
      data: { name: data.name, email: data.email, passwordHash, role: 'CUSTOMER' },
    });
    if (customer)
      await tx.customer.update({ where: { id: customer.id }, data: { userId: user.id } });
    else
      await tx.customer.create({ data: { name: data.name, email: data.email, userId: user.id } });
    return user;
  });
}
const dummyHash = bcrypt.hash('DummyPassword!Brightloop', 12);
export async function login(email: string, password: string) {
  const u = await db.user.findUnique({ where: { email } });
  const match = await bcrypt.compare(password, u?.passwordHash ?? (await dummyHash));
  assert(u?.isActive && match, 401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  return u;
}
export async function forgot(email: string) {
  const u = await db.user.findUnique({ where: { email } });
  if (!u?.isActive) return;
  const token = randomBytes(32).toString('hex');
  await db.passwordResetToken.create({
    data: {
      userId: u.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
  });
  try {
    await sendMail(
      email,
      'Reset your Brightloop password',
      `Reset your password within 30 minutes: ${env.FRONTEND_URL}/reset-password?token=${token}`,
    );
  } catch (error) {
    console.error('Password reset email delivery failed');
  }
}
export async function reset(token: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 12);
  await transaction(async (tx) => {
    const record = await tx.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: true },
    });
    assert(
      record && !record.usedAt && record.expiresAt > new Date() && record.user.isActive,
      400,
      'INVALID_TOKEN',
      'Reset link is expired or invalid',
    );
    const consumed = await tx.passwordResetToken.updateMany({
      where: { id: record.id, usedAt: null, expiresAt: { gt: new Date() } },
      data: { usedAt: new Date() },
    });
    assert(consumed.count === 1, 400, 'INVALID_TOKEN', 'Reset link already used');
    await tx.user.update({
      where: { id: record.userId },
      data: { passwordHash, sessionVersion: { increment: 1 } },
    });
    await tx.passwordResetToken.updateMany({
      where: { userId: record.userId, usedAt: null },
      data: { usedAt: new Date() },
    });
  });
}
