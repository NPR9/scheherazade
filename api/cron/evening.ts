// Evening check-in — 18:00 IST
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { respond } from '../../lib/scheherazade';
import { sendTelegram } from '../../lib/telegram';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const prompt = `18:00 evening check-in.
Ask: "End of work. What moved? What stays for tomorrow?"
Short. One line.`;

  try {
    const reply = await respond(prompt);
    await sendTelegram(reply);
    res.status(200).json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
