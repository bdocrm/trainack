import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

type Params = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: Params) {
  const { title, description, category } = await req.json();
  await db.prepare('UPDATE features SET title=$1, description=$2, category=$3 WHERE id=$4').run(title, description, category, params.id);
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  await db.prepare('DELETE FROM features WHERE id = $1').run(params.id);
  return NextResponse.json({ success: true });
}
