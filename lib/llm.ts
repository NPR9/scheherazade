// Pure-free LLM router. Gemini primary, Groq fallback.

type Message = { role: 'system' | 'user' | 'assistant'; content: string };

const GEMINI_MODEL = 'gemini-2.5-flash';
const GROQ_MODEL = 'llama-3.1-8b-instant';

export async function chat(messages: Message[]): Promise<string> {
  const errors: string[] = [];
  try {
    return await callGemini(messages);
  } catch (e: any) {
    errors.push(`Gemini: ${e.message || e}`);
  }
  try {
    return await callGroq(messages);
  } catch (e: any) {
    errors.push(`Groq: ${e.message || e}`);
  }
  throw new Error(`Both LLM providers failed. ${errors.join(' | ')}`);
}

async function callGemini(messages: Message[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const systemMsg = messages.find((m) => m.role === 'system')?.content ?? '';
  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const body: any = { contents };
  if (systemMsg) body.systemInstruction = { parts: [{ text: systemMsg }] };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

async function callGroq(messages: Message[]): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: GROQ_MODEL, messages }),
  });

  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}
