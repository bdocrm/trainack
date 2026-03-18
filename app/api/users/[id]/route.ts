import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { username, password, displayName, role, status } = await request.json();

  const user = await db.prepare('SELECT id FROM users WHERE id = $1').get(params.id);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Check username uniqueness if changing
  if (username) {
    const existing = await db.prepare('SELECT id FROM users WHERE username = $1 AND id != $2').get(username, params.id);
    if (existing) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }
  }

  // Build dynamic update
  const updates: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (username) { updates.push(`username = $${idx++}`); values.push(username); }
  if (displayName) { updates.push(`"displayName" = $${idx++}`); values.push(displayName); }
  if (role) { updates.push(`role = $${idx++}`); values.push(role); }
  if (status) { updates.push(`status = $${idx++}`); values.push(status); }
  if (password) {
    const hashed = await bcrypt.hash(password, 12);
    updates.push(`password = $${idx++}`);
    values.push(hashed);
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  values.push(params.id);
  await db.prepare(
    `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx}`
  ).run(...values);

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Don't allow self-deletion
  if (params.id === session.userId) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
  }

  await db.prepare('DELETE FROM users WHERE id = $1').run(params.id);
  return NextResponse.json({ success: true });
}
