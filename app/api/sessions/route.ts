import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const sessions = await db.prepare('SELECT * FROM sessions ORDER BY "createdAt" DESC').all() as {
    id: string; title: string; systemId: string; coveredFeatureIds: string; [key: string]: unknown;
  }[];
  const result = sessions.map(s => ({
    ...s,
    coveredFeatureIds: JSON.parse(s.coveredFeatureIds || '[]'),
  }));
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, systemId, trainerId, sessionDate, location, coveredFeatureIds = [], notes = '' } = body;
    if (!title || !systemId) return NextResponse.json({ error: 'title and systemId required' }, { status: 400 });
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    await db.prepare('INSERT INTO sessions (id, "clientId", title, "systemId", "trainerId", "sessionDate", location, "coveredFeatureIds", notes, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)').run(
      id, '', title, systemId, trainerId ?? 'Trainer Admin', sessionDate ?? createdAt.split('T')[0],
      location ?? '', JSON.stringify(coveredFeatureIds), notes, 'pending'
    );
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/sessions]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
