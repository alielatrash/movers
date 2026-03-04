import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const NOTIFY_EMAIL = process.env.NOTIFICATION_EMAIL ?? '';

export async function POST(req: NextRequest) {
  const data = await req.json();

  const {
    pickupAddress,
    dropoffAddress,
    moveDate,
    moveTime,
    moveItems,
    moveItemsOther,
    distanceKm,
    truckType,
    manpower,
    packaging,
    liftCrane,
    contactName,
    contactPhone,
    contactEmail,
    notes,
    estimatedPrice,
  } = data;

  const services = [
    manpower?.enabled ? `Manpower (${manpower.count} person${manpower.count > 1 ? 's' : ''})` : null,
    packaging ? 'Packaging' : null,
    liftCrane ? 'Lift / Crane' : null,
  ].filter(Boolean).join(', ') || 'None';

  const html = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#161E3C">
  <div style="background:#161E3C;padding:24px 32px;border-radius:12px 12px 0 0">
    <h1 style="color:#fff;margin:0;font-size:20px">🚛 New Booking — Trella Move</h1>
  </div>
  <div style="background:#f8f9fb;padding:24px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:8px 0;color:#6b7280;width:140px">Customer</td><td style="padding:8px 0;font-weight:600">${contactName}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">Phone</td><td style="padding:8px 0;font-weight:600">${contactPhone}</td></tr>
      ${contactEmail ? `<tr><td style="padding:8px 0;color:#6b7280">Email</td><td style="padding:8px 0">${contactEmail}</td></tr>` : ''}
      <tr><td colspan="2"><hr style="border:none;border-top:1px solid #e5e7eb;margin:8px 0"/></td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">Pickup</td><td style="padding:8px 0">${pickupAddress}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">Drop-off</td><td style="padding:8px 0">${dropoffAddress}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">Distance</td><td style="padding:8px 0">${distanceKm ? `~${distanceKm} km` : '—'}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">Date</td><td style="padding:8px 0">${moveDate || '—'}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">Time</td><td style="padding:8px 0">${moveTime || '—'}</td></tr>
      <tr><td colspan="2"><hr style="border:none;border-top:1px solid #e5e7eb;margin:8px 0"/></td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">Truck</td><td style="padding:8px 0">${truckType}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">Moving</td><td style="padding:8px 0">${moveItems === 'other' ? moveItemsOther : moveItems}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">Add-ons</td><td style="padding:8px 0">${services}</td></tr>
      ${notes ? `<tr><td style="padding:8px 0;color:#6b7280">Notes</td><td style="padding:8px 0">${notes}</td></tr>` : ''}
      <tr><td colspan="2"><hr style="border:none;border-top:1px solid #e5e7eb;margin:8px 0"/></td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">Est. Price</td><td style="padding:8px 0;font-weight:700;color:#E87A3A;font-size:16px">${estimatedPrice || '—'} EGP</td></tr>
    </table>
  </div>
  <p style="font-size:11px;color:#9ca3af;text-align:center;margin-top:16px">Trella Move — ${new Date().toISOString()}</p>
</div>`;

  try {
    if (!NOTIFY_EMAIL || !process.env.RESEND_API_KEY) {
      console.warn('[booking] RESEND_API_KEY or NOTIFICATION_EMAIL not set — skipping email');
    } else {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'Trella Move <onboarding@resend.dev>',
        to: NOTIFY_EMAIL,
        subject: `New booking: ${contactName} · ${moveDate}`,
        html,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[booking] email error', err);
    // Still return 200 so the form confirmation shows — don't block UX on email failure
    return NextResponse.json({ ok: true, warn: 'email failed' });
  }
}
