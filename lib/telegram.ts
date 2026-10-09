// Thin Telegram sender. We handle incoming via webhook route directly.

export async function sendTelegram(text: string, chatId?: string | number): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN not set');
  const target = chatId ?? process.env.TELEGRAM_ALLOWED_USER_ID;
  if (!target) throw new Error('No chat target (set TELEGRAM_ALLOWED_USER_ID)');

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: target,
      text,
      parse_mode: 'Markdown',
    }),
  });

  if (!res.ok) throw new Error(`Telegram send failed: ${res.status}`);
}
