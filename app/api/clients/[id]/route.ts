import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const client = await db.prepare('SELECT * FROM clients WHERE id = $1').get(params.id);
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(client);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const body = await req.json();
  const { name, company, email, phone, address, status } = body;
  await db.prepare(
    'UPDATE clients SET name=$1, company=$2, email=$3, phone=$4, address=$5, status=$6 WHERE id=$7'
  ).run(name, company, email, phone, address, status, params.id);
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  await db.prepare('DELETE FROM clients WHERE id = $1').run(params.id);
  return NextResponse.json({ success: true });
}
