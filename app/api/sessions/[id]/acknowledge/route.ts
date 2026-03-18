import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { sendAcknowledgmentNotification, sendAcknowledgementConfirmation } from '@/lib/email';

type Params = { params: { id: string } };

export async function POST(req: NextRequest, { params }: Params) {
  const { clientName, email, campaign, position, clientSignature, agreeToTerms, comments } = await req.json();

  if (!clientName || !email || !campaign || !position || !clientSignature || !agreeToTerms) {
    return NextResponse.json({ error: 'clientName, email, campaign, position, clientSignature, and agreeToTerms are required' }, { status: 400 });
  }

  // Check session exists
  const sessionRow = await db.prepare('SELECT * FROM sessions WHERE id = $1').get(params.id) as {
    id: string; title: string; status: string; systemId: string; trainerId: string; coveredFeatureIds: string; [key: string]: unknown;
  } | undefined;
  if (!sessionRow) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

  const id = uuidv4();
  const acknowledgedAt = new Date().toISOString();

  // Get client IP safely
  const forwarded = req.headers.get('x-forwarded-for');
  const ipAddress = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

  await db.prepare('INSERT INTO acknowledgments (id, "sessionId", "clientName", email, campaign, position, "clientSignature", "acknowledgedAt", "ipAddress", "agreeToTerms", comments) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)').run(
    id, params.id, clientName, email, campaign, position, clientSignature, acknowledgedAt, ipAddress, agreeToTerms ? 1 : 0, comments ?? ''
  );

  await db.prepare("UPDATE sessions SET status = 'signed' WHERE id = $1").run(params.id);

  // Send email notifications (fire-and-forget – don't block the response)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const notifyEmail = process.env.SMTP_FROM_EMAIL;

  // Get covered features
  const coveredFeatureIds = JSON.parse((sessionRow.coveredFeatureIds as string) || '[]');
  let features: { title: string; description: string }[] = [];
  if (coveredFeatureIds.length > 0) {
    const placeholders = coveredFeatureIds.map((_: string, i: number) => `$${i + 1}`).join(',');
    const featureRows = await db.prepare(`SELECT title, description FROM features WHERE id IN (${placeholders})`).all(...coveredFeatureIds) as { title: string; description: string }[];
    features = featureRows;
  }

  // Send notification to trainer
  if (notifyEmail) {
    sendAcknowledgmentNotification({
      toEmail: notifyEmail,
      sessionTitle: sessionRow.title as string,
      signerName: clientName,
      campaign,
      position,
      signedAt: acknowledgedAt,
      sessionUrl: `${appUrl}/sessions/${params.id}`,
    }).catch(err => console.error('❌ Trainer notification email failed:', err));
  }

  // Send acknowledgement confirmation to participant
  console.log(`📧 Sending acknowledgement to: ${email}`);
  console.log(`📋 Features to include: ${features.length} features`);
  sendAcknowledgementConfirmation({
    toEmail: email,
    toName: clientName,
    sessionTitle: sessionRow.title as string,
    trainerName: sessionRow.trainerId as string,
    campaign,
    position,
    features,
    signature: clientSignature,
    acknowledgedAt,
  }).then(() => {
    console.log(`✅ Acknowledgement email sent to ${email}`);
  }).catch(err => {
    console.error(`❌ Acknowledgement email failed for ${email}:`, err);
  });

  return NextResponse.json({ id, acknowledgedAt }, { status: 201 });
}
