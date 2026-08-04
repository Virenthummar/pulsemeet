import { Resend } from 'resend';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_local_dev';

const FRONTEND_URL = process.env.NODE_ENV === 'production' 
  ? 'https://pulsemeet.com' 
  : 'http://localhost:5173';

function getDistanceString(distanceKm) {
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} meters away`;
  return `${distanceKm.toFixed(1)} km away`;
}

export function generateUnsubscribeToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyUnsubscribeToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export async function sendDigestEmail(user, activitiesData) {
  const isMock = !process.env.RESEND_API_KEY;
  const unsubToken = generateUnsubscribeToken(user.id);
  const unsubLink = `${FRONTEND_URL}/api/notifications/unsubscribe?token=${unsubToken}`;

  const activityHtml = activitiesData.map(data => {
    const { activity, distanceKm } = data;
    const distanceStr = getDistanceString(distanceKm);
    const dateStr = new Date(activity.datetime).toLocaleString('en-US', { 
      weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });

    return `
      <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px;">
        ${activity.coverImage ? `<img src="${activity.coverImage}" alt="Cover" style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px; margin-bottom: 12px;" />` : ''}
        <h3 style="margin: 0 0 8px 0; color: #1e293b;">${activity.title}</h3>
        <p style="margin: 0 0 4px 0; color: #64748b; font-size: 14px;">📍 ${distanceStr}</p>
        <p style="margin: 0 0 12px 0; color: #64748b; font-size: 14px;">🕒 ${dateStr}</p>
        <p style="margin: 0 0 16px 0; color: #64748b; font-size: 14px;">Host: <strong>${activity.hostName}</strong></p>
        <a href="${FRONTEND_URL}/?activity=${activity.id}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">View & Join</a>
      </div>
    `;
  }).join('');

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #334155;">
      <h2 style="color: #4f46e5;">New Meetups Near You!</h2>
      <p style="font-size: 16px;">Hi ${user.name.split(' ')[0]},</p>
      <p style="font-size: 16px; margin-bottom: 24px;">Here are some new activities posted in your area that match your interests:</p>
      
      ${activityHtml}
      
      <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8;">
        <p>You're receiving this because you enabled nearby notifications in PulseMeet.</p>
        <a href="${unsubLink}" style="color: #94a3b8; text-decoration: underline;">Turn off these emails</a>
      </div>
    </div>
  `;

  const subject = activitiesData.length === 1 
    ? `New nearby: ${activitiesData[0].activity.title} — ${getDistanceString(activitiesData[0].distanceKm)}`
    : `${activitiesData.length} new meetups near you!`;

  if (isMock) {
    console.log('\n=============================================');
    console.log(`[MOCK EMAIL SENT TO ${user.email}]`);
    console.log(`Subject: ${subject}`);
    console.log(`Unsubscribe link: ${unsubLink}`);
    console.log('=============================================\n');
    return { success: true, mock: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'PulseMeet <hello@pulsemeet.com>',
      to: user.email,
      subject,
      html
    });

    if (error) {
      console.error('Resend API Error:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.error('Email sending failed:', err);
    return { success: false, error: err };
  }
}
