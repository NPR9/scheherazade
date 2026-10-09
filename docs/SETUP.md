# Scheherazade setup — step by step

~45 minutes end to end. Follow in order.

## 1. Google Drive — folder + service account

1. Create folder in Google Drive called `Scheherazade`.
2. Open the folder, copy the folder ID from URL (`drive.google.com/drive/folders/XXXXX` → `XXXXX`).
3. Go to https://console.cloud.google.com/
4. New project: "scheherazade"
5. Enable Google Drive API (APIs & Services → Library → search "Drive" → Enable).
6. Create service account: IAM & Admin → Service Accounts → Create.
   - Name: `scheherazade-bot`
   - Role: skip (we grant Drive access directly on the folder)
7. On the service account, Keys tab → Add Key → JSON. Downloads a JSON file. Keep safe.
8. Open the JSON file, copy the `client_email` value (looks like `scheherazade-bot@scheherazade.iam.gserviceaccount.com`).
9. Back in Drive, right-click `Scheherazade/` folder → Share → paste that email → Editor → Send.

## 2. Upload starter kit to Drive

Upload these to `Scheherazade/`:
- `config/SOUL.md`
- `briefs/*.md` (all 9 files)
- `tasks/*.md` (all 4 files)
- Create empty `logs/` folder

Keep the folder structure. Scheherazade reads by path.

## 3. Telegram bot

1. Open Telegram on phone.
2. Message `@BotFather`.
3. `/newbot` → name: "Scheherazade" → username: `your_scheherazade_bot` (whatever is free).
4. Copy bot token.
5. Message `@userinfobot` → copy your numeric user ID.
6. Generate random webhook secret: on phone just type gibberish or use any password manager, e.g. `sch_wh_8kj2n4m9x7`

## 4. Gemini + Groq keys

- **Gemini**: https://aistudio.google.com/apikey → Create API Key → copy
- **Groq**: https://console.groq.com/keys → Create API Key → copy

## 5. Deploy to Vercel

1. Push this starter folder to GitHub as a repo (private).
   - Phone: GitHub mobile app can create repo from zip
2. https://vercel.com → New Project → Import your repo
3. Framework: "Other" (it's just serverless functions, no Next.js UI yet)
4. Deploy with defaults.

## 6. Set Vercel env vars

Project → Settings → Environment Variables. Add all from `.env.example`:

```
TELEGRAM_BOT_TOKEN=<from BotFather>
TELEGRAM_WEBHOOK_SECRET=<your random string>
TELEGRAM_ALLOWED_USER_ID=<your numeric ID>
GEMINI_API_KEY=<from AI Studio>
GROQ_API_KEY=<from Groq>
GOOGLE_SERVICE_ACCOUNT_JSON=<paste entire JSON file content as one line>
GOOGLE_DRIVE_FOLDER_ID=<Scheherazade/ folder ID>
CRON_SECRET=<another random string>
```

Redeploy after adding env vars.

## 7. Register Telegram webhook

From any terminal (or Vercel's web shell):

```
curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://<YOUR-VERCEL-URL>/api/telegram/webhook",
    "secret_token": "<TELEGRAM_WEBHOOK_SECRET>"
  }'
```

Should return `{"ok":true,...}`.

## 8. Test

Open your bot in Telegram. Send "hi". Should get a reply within ~5 seconds.

If silence: Vercel → Deployments → latest → Functions → click `/api/telegram/webhook` → view logs for the error.

## 9. External cron — cron-job.org

1. https://cron-job.org/ → sign up (free).
2. Create 5 jobs. For each:
   - URL: `https://<YOUR-VERCEL-URL>/api/cron/<name>`
   - Method: GET
   - Headers: `Authorization: Bearer <CRON_SECRET>`
   - Schedule: see `CRON_SCHEDULE.md`

See `CRON_SCHEDULE.md` for exact UTC times.

## 10. Done

Your bot now:
- Replies to any message, with full project context
- Pings you 5 times a day on IST schedule
- Writes to Drive files you can see on phone
- Costs zero rupees

Reply to the 07:00 morning digest tomorrow with "test working". If Scheherazade acknowledges, system is live.
