import nodemailer from 'nodemailer';
import type { Prisma } from '@prisma/client';
import { env } from '../config/env.js';
import { assert } from '../shared/errors.js';
import { db } from '../infra/db.js';
const transport = env.SMTP_HOST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
      connectionTimeout: 10000,
      socketTimeout: 15000,
      disableFileAccess: true,
      disableUrlAccess: true,
    })
  : undefined;
export async function sendMail(
  to: string,
  subject: string,
  text: string,
  attachments: { filename: string; content: Buffer }[] = [],
) {
  assert(transport, 503, 'MAIL_UNAVAILABLE', 'SMTP is not configured');
  await transport.sendMail({ from: env.MAIL_FROM, to, subject, text, attachments });
}
export async function queueMail(
  tx: Prisma.TransactionClient,
  to: string,
  subject: string,
  text: string,
) {
  return tx.mailOutbox.create({ data: { to, subject, text } });
}
export async function flushMail() {
  const messages = await db.mailOutbox.findMany({
    where: { sentAt: null, nextAttemptAt: { lte: new Date() } },
    orderBy: { createdAt: 'asc' },
    take: 50,
  });
  for (const msg of messages) {
    const lease = await db.mailOutbox.updateMany({
      where: { id: msg.id, sentAt: null, nextAttemptAt: { lte: new Date() } },
      data: { nextAttemptAt: new Date(Date.now() + 60000) },
    });
    if (!lease.count) continue;
    try {
      await sendMail(msg.to, msg.subject, msg.text);
      await db.mailOutbox.update({ where: { id: msg.id }, data: { sentAt: new Date() } });
    } catch {
      await db.mailOutbox.update({
        where: { id: msg.id },
        data: {
          attempts: { increment: 1 },
          nextAttemptAt: new Date(
            Date.now() + Math.min(3600000, 60000 * 2 ** Math.min(msg.attempts, 6)),
          ),
        },
      });
    }
  }
}
