// Review sync — 10:00 IST
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { respond } from '../../lib/scheherazade';
import { sendTelegram } from '../../lib/telegram';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const prompt = `10:00 review sync. Ask NPR exactly:
"Review time. What's done since morning? What's new? What's blocked?"
Keep to that one line. Nothing else.`;

  try {
    const reply = await respond(prompt);
    await sendTelegram(reply);
    res.status(200).json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
