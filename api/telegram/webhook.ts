// Telegram webhook — Vercel serverless function
// Receives every message to the bot, routes to Scheherazade, replies.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { respond } from '../../lib/scheherazade';
import { sendTelegram } from '../../lib/telegram';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Telegram secret token check
  const secret = req.headers['x-telegram-bot-api-secret-token'];
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'bad secret' });
  }

  const update = req.body;
  const msg = update?.message;
  if (!msg?.text) return res.status(200).json({ ok: true });

  // Only NPR
  const allowed = process.env.TELEGRAM_ALLOWED_USER_ID;
  if (allowed && String(msg.from?.id) !== allowed) {
    return res.status(200).json({ ok: true });
  }

  // Respond asynchronously to avoid Telegram's 60s webhook timeout
  res.status(200).json({ ok: true });

  try {
    const reply = await respond(msg.text);
    await sendTelegram(reply, msg.chat.id);
  } catch (e: any) {
    console.error('Scheherazade error:', e);
    await sendTelegram(`Error: ${e.message || 'unknown'}`, msg.chat.id);
  }
}
