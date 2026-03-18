import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const system = await db.prepare('SELECT * FROM systems WHERE id = $1').get(params.id);
  if (!system) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const features = await db.prepare('SELECT * FROM features WHERE "systemId" = $1 ORDER BY "sortOrder" ASC').all(params.id);
  return NextResponse.json({ ...(system as object), features });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { name, description, version } = await req.json();
  await db.prepare('UPDATE systems SET name=$1, description=$2, version=$3 WHERE id=$4').run(name, description, version, params.id);
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  // Cascade: delete features belonging to this system
  await db.prepare('DELETE FROM features WHERE "systemId" = $1').run(params.id);
  await db.prepare('DELETE FROM systems WHERE id = $1').run(params.id);
  return NextResponse.json({ success: true });
}
