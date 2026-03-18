import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';
import { v4 as uuid } from 'uuid';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const users = await db.prepare(
    'SELECT id, username, "displayName", role, status, "createdAt" FROM users ORDER BY "createdAt" DESC'
  ).all();

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { username, password, displayName, role } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
  }

  // Check if username exists
  const existing = await db.prepare('SELECT id FROM users WHERE username = $1').get(username);
  if (existing) {
    return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
  }

  const id = uuid();
  const hashed = await bcrypt.hash(password, 12);

  await db.prepare(
    'INSERT INTO users (id, username, password, "displayName", role, status, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, NOW())'
  ).run(id, username, hashed, displayName || username, role || 'user', 'active');

  return NextResponse.json({ id, username, displayName: displayName || username, role: role || 'user' }, { status: 201 });
}
