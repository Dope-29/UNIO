import bcrypt from 'bcrypt';
import { db } from '../../infra/db.js';
export const staffSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
} as const;
export async function createStaff(d: { name: string; email: string; password: string }) {
  return db.user.create({
    data: {
      name: d.name,
      email: d.email,
      passwordHash: await bcrypt.hash(d.password, 12),
      role: 'STAFF',
    },
    select: staffSelect,
  });
}
