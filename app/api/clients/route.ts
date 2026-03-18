import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const res = await db.prepare('SELECT * FROM clients ORDER BY "createdAt" DESC').all();
  return NextResponse.json(res);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, company, email, phone, address, status = 'active' } = body;
  if (!name || !company || !email) {
    return NextResponse.json({ error: 'name, company, email are required' }, { status: 400 });
  }
  const id = uuidv4();
  await db.prepare('INSERT INTO clients (id, name, company, email, phone, address, status) VALUES ($1, $2, $3, $4, $5, $6, $7)').run(
    id, name, company, email, phone ?? '', address ?? '', status
  );
  return NextResponse.json({ id, name, company, email, phone, address, status, createdAt: new Date().toISOString() }, { status: 201 });
}
