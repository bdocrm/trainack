import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const systems = await db.prepare('SELECT * FROM systems ORDER BY "createdAt" DESC').all();
  const result = await Promise.all((systems as { id: string; name: string; description: string; version: string; createdAt: string }[]).map(async (s) => ({
    ...s,
    features: await db.prepare('SELECT * FROM features WHERE "systemId" = $1 ORDER BY "sortOrder" ASC').all(s.id),
  })));
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, description, version } = body;
  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });
  const id = uuidv4();
  await db.prepare('INSERT INTO systems (id, name, description, version) VALUES ($1, $2, $3, $4)').run(id, name, description ?? '', version ?? '1.0');
  return NextResponse.json({ id, name, description, version, features: [], createdAt: new Date().toISOString() }, { status: 201 });
}
