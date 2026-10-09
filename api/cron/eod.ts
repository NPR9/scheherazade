// EOD review — 22:00 IST
// Writes /logs/YYYY-MM-DD.md, flags items rescheduled 2+ times.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { respond } from '../../lib/scheherazade';
import { sendTelegram } from '../../lib/telegram';
import { appendFile, readFile, writeFile } from '../../lib/drive';

function todayIST(): string {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().slice(0, 10);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const date = todayIST();

  const prompt = `22:00 EOD review for ${date}.
1. Read tasks/active.md, tasks/done-log.md.
2. Produce EOD summary in format:
   # ${date}
   ## Completed today
   - ...
   ## Carried to tomorrow
   - ...
   ## Rescheduled 2+ times (DROP REVIEW)
   - ...
3. In Telegram reply, give a 3-line summary ending with: "EOD log written. Anything to add before I close the day?"`;

  try {
    const reply = await respond(prompt);
    await sendTelegram(reply);

    // Stub log file — the model should produce the body; this guarantees a file exists even on empty days
    try {
      await readFile(`logs/${date}.md`);
    } catch {
      await writeFile(
        `logs/${date}.md`,
        `# ${date}\n\n(EOD summary pending NPR confirmation)\n`
      );
    }

    res.status(200).json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
