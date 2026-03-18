import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { sendSignReminder } from '@/lib/email';
import { formatDate } from '@/lib/utils';

type Params = { params: { id: string } };

export async function POST(req: NextRequest, { params }: Params) {
  const { email, name } = await req.json();

  if (!email || !name) {
    return NextResponse.json({ error: 'email and name are required' }, { status: 400 });
  }

  const session = await db.prepare('SELECT * FROM sessions WHERE id = $1').get(params.id) as {
    id: string; title: string; trainerId: string; sessionDate: string | Date;
  } | undefined;

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  await sendSignReminder({
    toEmail: email,
    toName: name,
    sessionTitle: session.title,
    trainerName: session.trainerId,
    sessionDate: formatDate(session.sessionDate instanceof Date ? session.sessionDate.toISOString() : session.sessionDate),
    signUrl: `${appUrl}/sessions/${params.id}/sign`,
  });

  return NextResponse.json({ success: true });
}
