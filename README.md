# Scheherazade

Personal secretary agent. Pure-free stack. Telegram front, Gemini/Groq brain, Google Drive memory, Vercel host.

## What's in this folder

```
scheherazade/
├── README.md                this file
├── package.json             Next.js deps
├── vercel.json              function config (no Vercel crons used)
├── .env.example             env vars needed
├── config/
│   └── SOUL.md              Scheherazade's persona + hard rules
├── briefs/                  project context — Scheherazade reads before acting
│   ├── goldfinch.md
│   ├── engen3.md
│   ├── squad.md
│   ├── metro.md
│   ├── genghis.md
│   ├── engine-block.md
│   ├── robotics.md
│   ├── iitr-capstone.md
│   └── simhastha.md
├── tasks/                   live state — Scheherazade writes
│   ├── active.md            today only, HARD CAP 5
│   ├── week.md              next 7 days
│   ├── parked.md            no date
│   └── done-log.md          completed rolling
├── logs/                    daily EOD summaries (auto-generated)
├── lib/
│   ├── llm.ts               Gemini → Groq fallback
│   ├── drive.ts             Google Drive helpers
│   ├── telegram.ts          Telegram send
│   └── scheherazade.ts      core routing: SOUL + briefs + tasks → LLM
├── api/
│   ├── telegram/
│   │   └── webhook.ts       Telegram → Scheherazade → reply
│   └── cron/
│       ├── morning.ts       07:00 digest
│       ├── review.ts        10:00 sync
│       ├── afternoon.ts     14:00 check-in
│       ├── evening.ts       18:00 check-in
│       └── eod.ts           22:00 EOD + log write
└── docs/
    ├── SETUP.md             step-by-step first-time setup
    └── CRON_SCHEDULE.md     exact cron-job.org entries
```

## Quick start

1. Read `docs/SETUP.md` top to bottom.
2. Deploy to Vercel.
3. Set env vars.
4. Upload `briefs/`, `tasks/`, `config/`, `logs/` to Google Drive folder `Scheherazade/`.
5. Register Telegram webhook.
6. Add 5 cron-job.org jobs.
7. Say "hi" to your bot. Done.

## Cost

₹0/month if daily usage stays under free tiers (Gemini ~1500 req/day typical, Groq generous). If quota exhausts regularly, add paid Gemini ($0 base, pay-per-use ~₹200-500/mo) or move to hybrid #1 with Claude API.
