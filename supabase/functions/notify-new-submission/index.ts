// notify-new-submission
//
// Supabase Edge Function triggered by a Database Webhook on INSERT
// to the user_submissions table.
//
// Sends an email notification to the admin via Resend when a new
// photo submission arrives.
//
// CUSTOMIZATION:
// - ADMIN_EMAIL: recipient address for notifications
// - FROM_EMAIL: verified sending address on your Resend domain
// - DASHBOARD_URL: full URL to the admin submissions page

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const ADMIN_EMAIL = 'damannaband@gmail.com';
const FROM_EMAIL = 'notifications@damannaband.com'; // replace with your verified Resend domain
const DASHBOARD_URL = 'https://www.damannaband.com/admin/submissions'; // replace with your production URL

serve(async (req) => {
  try {
    // Supabase Database Webhooks send a POST with the record payload
    const payload = await req.json();
    const record = payload.record;

    if (!record) {
      return new Response('No record in payload', { status: 400 });
    }

    const submitterName = record.submitted_by || 'Unknown';
    const submitterEmail = record.email || 'Not provided';
    const gigDate = record.date || 'Not provided';
    const location = record.location || 'Not provided';
    const submittedAt = new Date(record.created_at).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #e4e4e7;">
        <div style="background: #18181b; padding: 32px; border-radius: 12px;">
          <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 8px;">New Photo Submission</h1>
          <p style="color: #a1a1aa; margin: 0 0 24px;">A fan has submitted a photo for review.</p>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px; width: 120px;">Name</td>
              <td style="padding: 8px 0; color: #ffffff; font-size: 14px;">${submitterName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Email</td>
              <td style="padding: 8px 0; color: #ffffff; font-size: 14px;">${submitterEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Gig date</td>
              <td style="padding: 8px 0; color: #ffffff; font-size: 14px;">${gigDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Location</td>
              <td style="padding: 8px 0; color: #ffffff; font-size: 14px;">${location}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Submitted</td>
              <td style="padding: 8px 0; color: #ffffff; font-size: 14px;">${submittedAt}</td>
            </tr>
          </table>

          <div style="margin-top: 32px;">
            <a
              href="${DASHBOARD_URL}"
              style="display: inline-block; background: #ffffff; color: #000000; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none;"
            >
              Review in Dashboard
            </a>
          </div>

          <p style="color: #52525b; font-size: 12px; margin-top: 24px;">
            This is an automated notification from the Dam Anna website.
          </p>
        </div>
      </div>
    `;

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) throw new Error('RESEND_API_KEY secret is not set');

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `New photo submission -- Dam Anna`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend API error: ${error}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('notify-new-submission error:', err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});