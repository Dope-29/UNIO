import bcrypt from 'bcrypt';
import { db, transaction } from '../../infra/db.js';
import { assert } from '../../shared/errors.js';
export async function changePassword(id: string, currentPassword: string, password: string) {
  const user = await db.user.findUniqueOrThrow({ where: { id } });
  assert(
    await bcrypt.compare(currentPassword, user.passwordHash),
    400,
    'INVALID_PASSWORD',
    'Current password is incorrect',
  );
  const passwordHash = await bcrypt.hash(password, 12);
  await transaction(async (tx) => {
    const changed = await tx.user.updateMany({
      where: { id, passwordHash: user.passwordHash },
      data: { passwordHash, sessionVersion: { increment: 1 } },
    });
    assert(
      changed.count === 1,
      409,
      'PASSWORD_CHANGED',
      'Password changed concurrently; log in again',
    );
    await tx.passwordResetToken.updateMany({
      where: { userId: id, usedAt: null },
      data: { usedAt: new Date() },
    });
  });
}
