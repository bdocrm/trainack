import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await db.prepare('SELECT * FROM sessions WHERE id = $1').get(params.id) as {
    id: string; title: string; systemId: string; coveredFeatureIds: string; sessionDate: Date; createdAt: Date; [key: string]: unknown;
  } | undefined;
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const coveredFeatureIds: string[] = JSON.parse(session.coveredFeatureIds || '[]');
  const system = await db.prepare('SELECT * FROM systems WHERE id = $1').get(session.systemId);
  const allFeatures = await db.prepare('SELECT * FROM features WHERE "systemId" = $1 ORDER BY "sortOrder" ASC').all(session.systemId);
  const coveredFeatures = (allFeatures as { id: string }[]).filter(f => coveredFeatureIds.includes(f.id));
  const acknowledgments = await db.prepare('SELECT * FROM acknowledgments WHERE "sessionId" = $1 ORDER BY "acknowledgedAt" ASC').all(params.id);

  return NextResponse.json({
    ...session,
    coveredFeatureIds,
    system,
    coveredFeatures,
    acknowledgments,
  });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const body = await req.json();
  const { trainerId, sessionDate, location, coveredFeatureIds, notes, status } = body;
  await db.prepare(
    'UPDATE sessions SET "trainerId"=$1, "sessionDate"=$2, location=$3, "coveredFeatureIds"=$4, notes=$5, status=$6 WHERE id=$7'
  ).run(trainerId, sessionDate, location, JSON.stringify(coveredFeatureIds), notes, status, params.id);
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  await db.prepare('DELETE FROM acknowledgments WHERE "sessionId" = $1').run(params.id);
  await db.prepare('DELETE FROM sessions WHERE id = $1').run(params.id);
  return NextResponse.json({ success: true });
}
