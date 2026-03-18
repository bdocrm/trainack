import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const features = await db.prepare('SELECT * FROM features WHERE "systemId" = $1 ORDER BY "sortOrder" ASC').all(params.id);
  return NextResponse.json(features);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { title, description, category } = await req.json();
  if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 });
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  const maxOrderResult = await db.prepare('SELECT MAX("sortOrder") as m FROM features WHERE "systemId" = $1').get(params.id) as { m: number | null };
  const maxOrder = maxOrderResult?.m ?? 0;
  await db.prepare('INSERT INTO features (id, "systemId", title, description, category, "sortOrder") VALUES ($1, $2, $3, $4, $5, $6)').run(
    id, params.id, title, description ?? '', category ?? 'Core', maxOrder + 1
  );
  return NextResponse.json({ id, systemId: params.id, title, description, category, sortOrder: maxOrder + 1, createdAt }, { status: 201 });
}
