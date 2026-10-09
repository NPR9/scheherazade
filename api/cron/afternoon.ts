// Afternoon check-in — 14:00 IST
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { respond } from '../../lib/scheherazade';
import { sendTelegram } from '../../lib/telegram';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const prompt = `14:00 afternoon check-in. Per SOUL.md:
Read active.md. If any item added before 10:00 is still open, name it and ask "touched this yet?"
Otherwise ask "Active list status?"
Keep terse. One flag max.`;

  try {
    const reply = await respond(prompt);
    await sendTelegram(reply);
    res.status(200).json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
