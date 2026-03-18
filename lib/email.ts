import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const from = `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`;

/* ── helpers ──────────────────────────────────────────────── */

/** Notify the trainer (or admin) that someone signed a session. */
export async function sendAcknowledgmentNotification({
  toEmail,
  sessionTitle,
  signerName,
  campaign,
  position,
  signedAt,
  sessionUrl,
}: {
  toEmail: string;
  sessionTitle: string;
  signerName: string;
  campaign: string;
  position: string;
  signedAt: string;
  sessionUrl: string;
}) {
  await transporter.sendMail({
    from,
    to: toEmail,
    subject: `✅ New Acknowledgment – ${sessionTitle}`,
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;color:#0F172A">
        <div style="background:#160D76;padding:20px 24px;border-radius:8px 8px 0 0">
          <h2 style="margin:0;color:#fff;font-size:18px">Training Acknowledgment Received</h2>
        </div>
        <div style="border:1px solid #E2E8F0;border-top:0;padding:24px;border-radius:0 0 8px 8px">
          <p style="margin:0 0 16px"><strong>${signerName}</strong> has signed the acknowledgment for:</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px">
            <tr><td style="padding:6px 0;color:#64748B">Session</td><td style="padding:6px 0;font-weight:600">${sessionTitle}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Campaign</td><td style="padding:6px 0">${campaign}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Position</td><td style="padding:6px 0">${position}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Signed at</td><td style="padding:6px 0">${signedAt}</td></tr>
          </table>
          <a href="${sessionUrl}" style="display:inline-block;background:#160D76;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px">
            View Session
          </a>
        </div>
        <p style="font-size:11px;color:#94A3B8;margin-top:16px;text-align:center">
          Sent by Training Acknowledgment System
        </p>
      </div>
    `,
  });
}

/** Send a reminder email to a client asking them to sign. */
export async function sendSignReminder({
  toEmail,
  toName,
  sessionTitle,
  trainerName,
  sessionDate,
  signUrl,
}: {
  toEmail: string;
  toName: string;
  sessionTitle: string;
  trainerName: string;
  sessionDate: string;
  signUrl: string;
}) {
  await transporter.sendMail({
    from,
    to: toEmail,
    subject: `📝 Please sign your training acknowledgment – ${sessionTitle}`,
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;color:#0F172A">
        <div style="background:#160D76;padding:20px 24px;border-radius:8px 8px 0 0">
          <h2 style="margin:0;color:#fff;font-size:18px">Training Acknowledgment Reminder</h2>
        </div>
        <div style="border:1px solid #E2E8F0;border-top:0;padding:24px;border-radius:0 0 8px 8px">
          <p style="margin:0 0 16px">Hi <strong>${toName}</strong>,</p>
          <p style="margin:0 0 16px">This is a friendly reminder to sign the acknowledgment for your training session:</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px">
            <tr><td style="padding:6px 0;color:#64748B">Session</td><td style="padding:6px 0;font-weight:600">${sessionTitle}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Trainer</td><td style="padding:6px 0">${trainerName}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Date</td><td style="padding:6px 0">${sessionDate}</td></tr>
          </table>
          <a href="${signUrl}" style="display:inline-block;background:#160D76;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px">
            Sign Now
          </a>
          <p style="margin:16px 0 0;font-size:13px;color:#64748B">
            If you've already signed, please ignore this email.
          </p>
        </div>
        <p style="font-size:11px;color:#94A3B8;margin-top:16px;text-align:center">
          Sent by Training Acknowledgment System
        </p>
      </div>
    `,
  });
}

/** Send acknowledgement confirmation email to the participant with statement and features covered. */
export async function sendAcknowledgementConfirmation({
  toEmail,
  toName,
  sessionTitle,
  trainerName,
  campaign,
  position,
  features,
  signature,
  acknowledgedAt,
}: {
  toEmail: string;
  toName: string;
  sessionTitle: string;
  trainerName: string;
  campaign: string;
  position: string;
  features: { title: string; description: string }[];
  signature: string;
  acknowledgedAt: string;
}) {
  const featuresList = features.map(f => `
    <div style="margin-bottom:12px;padding:12px;background:#F5F6FA;border-left:4px solid #160D76;border-radius:4px">
      <strong style="color:#160D76">${f.title}</strong>
      <p style="margin:4px 0 0;color:#64748B;font-size:13px">${f.description}</p>
    </div>
  `).join('');

  await transporter.sendMail({
    from,
    to: toEmail,
    subject: `✅ Training Acknowledgment Confirmed – ${sessionTitle}`,
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;color:#0F172A">
        <div style="background:linear-gradient(135deg, #160D76 0%, #1E1199 100%);padding:24px;border-radius:8px 8px 0 0">
          <h2 style="margin:0;color:#fff;font-size:20px;font-weight:600">Training Acknowledgment Confirmed</h2>
          <p style="margin:8px 0 0;color:#4094d9;font-size:13px">Thank you for your participation</p>
        </div>
        <div style="border:1px solid #E2E8F0;border-top:0;padding:24px;border-radius:0 0 8px 8px">
          <p style="margin:0 0 16px">Hi <strong>${toName}</strong>,</p>
          <p style="margin:0 0 16px">This email confirms that your training acknowledgment has been successfully submitted and recorded.</p>
          
          <div style="background:#F5F6FA;border:1px solid #E2E8F0;padding:16px;border-radius:6px;margin:16px 0">
            <h3 style="margin:0 0 12px;color:#160D76;font-size:14px">Training Details</h3>
            <table style="width:100%;border-collapse:collapse;font-size:13px">
              <tr><td style="padding:6px 0;color:#64748B;font-weight:500">Session</td><td style="padding:6px 0;font-weight:600">${sessionTitle}</td></tr>
              <tr><td style="padding:6px 0;color:#64748B;font-weight:500">Trainer</td><td style="padding:6px 0">${trainerName}</td></tr>
              <tr><td style="padding:6px 0;color:#64748B;font-weight:500">Campaign</td><td style="padding:6px 0">${campaign}</td></tr>
              <tr><td style="padding:6px 0;color:#64748B;font-weight:500">Position</td><td style="padding:6px 0">${position}</td></tr>
              <tr><td style="padding:6px 0;color:#64748B;font-weight:500">Confirmed On</td><td style="padding:6px 0">${new Date(acknowledgedAt).toLocaleDateString()} ${new Date(acknowledgedAt).toLocaleTimeString()}</td></tr>
            </table>
          </div>

          <h3 style="margin:20px 0 12px;color:#160D76;font-size:14px;font-weight:600">Acknowledgment Statement</h3>
          <div style="background:#F5F6FA;border-left:4px solid #4094d9;padding:12px;border-radius:4px;font-size:13px;line-height:1.6">
            <p>I acknowledge that I have attended and participated in the system walkthrough and training conducted by <strong>${trainerName}</strong>. I confirm that the features listed below were demonstrated and explained to me, and I understand how to use them.</p>
          </div>

          <h3 style="margin:20px 0 12px;color:#160D76;font-size:14px;font-weight:600">Features & Functions Covered</h3>
          <div>${featuresList}</div>

          <h3 style="margin:20px 0 12px;color:#160D76;font-size:14px;font-weight:600">Your Signature</h3>
          <div style="background:#F5F6FA;border:1px solid #E2E8F0;padding:12px;border-radius:6px;text-align:center;">
            <img src="${signature}" alt="Signature" style="max-width:200px;height:auto;display:inline-block;border:1px solid #CBD5E1;border-radius:4px;padding:8px;background:#fff"/>
          </div>

          <p style="margin:20px 0 0;font-size:13px;color:#64748B">
            This acknowledgment is now part of your training record and has been shared with your trainer.
          </p>
        </div>
        <p style="font-size:11px;color:#94A3B8;margin-top:16px;text-align:center">
          Sent by Training Acknowledgment System
        </p>
      </div>
    `,
  });
}
