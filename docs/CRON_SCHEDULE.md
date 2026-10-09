# Cron schedule — cron-job.org entries

Scheherazade touchpoints in IST. cron-job.org uses UTC. IST = UTC + 5:30.

| IST | UTC | Endpoint | Purpose |
|---|---|---|---|
| 07:00 | 01:30 | `/api/cron/morning` | Morning digest, today's 5, pending, overnight additions |
| 10:00 | 04:30 | `/api/cron/review` | What's done, what's new, what's blocked |
| 14:00 | 08:30 | `/api/cron/afternoon` | Active list status, flag untouched items |
| 18:00 | 12:30 | `/api/cron/evening` | End of work, what moved |
| 22:00 | 16:30 | `/api/cron/eod` | Write daily log, flag rescheduled 2+ times |

## cron-job.org setup per job

For each row above:

1. **Title**: `Scheherazade — <name>` (e.g. "Scheherazade — morning")
2. **URL**: `https://<YOUR-VERCEL-URL>/api/cron/<name>`
3. **Request method**: GET
4. **Schedule**: Custom
   - Minute: 30 (for 30-past-the-hour) or 0 (for on-the-hour)
   - Hour: UTC hour from table
   - Day/Month: `*`
   - Day of week: `1-5` for weekdays only, or `*` for every day
5. **Advanced → Request headers**:
   - `Authorization: Bearer <YOUR CRON_SECRET>`
6. **Notifications**: enable "On failure" so you get email if a cron breaks
7. Save → Enable.

## Timezone test

After setting up, cron-job.org shows "next execution" in your local time. Verify morning = 07:00 your time.

## Changing cadence later

Edit the 5 jobs in cron-job.org directly. No redeploy needed. The Vercel endpoints stay the same.

## Weekend behavior

Default jobs run every day. If you want weekend-off:
- Monday–Friday: day-of-week `1-5`
- Saturday only EOD: separate job, day-of-week `6`, calls `/api/cron/eod`
- Sunday review: separate job, Sunday evening, calls `/api/cron/eod` (it includes rescheduled-2x cull)

Scheherazade herself decides what to say based on day of week once you tell her preference. For now default: every day.
