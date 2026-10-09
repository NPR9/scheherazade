// Morning digest — 07:00 IST (01:30 UTC)
// External scheduler (cron-job.org) hits this with CRON_SECRET header.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { respond } from '../../lib/scheherazade';
import { sendTelegram } from '../../lib/telegram';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const prompt = `Generate morning digest for NPR per SOUL.md 07:00 rules.
Format:
"Morning. 5 for today: 1. X 2. Y 3. Z 4. A 5. B.
Pending from yesterday: ...
Anything new from last night: ... (ask: add to active or park?)"
Keep terse. Use active.md and week.md as source of truth.`;

  try {
    const reply = await respond(prompt);
    await sendTelegram(reply);
    res.status(200).json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
