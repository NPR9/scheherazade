// Core Scheherazade logic: builds the system prompt from SOUL + relevant briefs,
// classifies the incoming message, decides which briefs to load.

import { chat } from './llm';
import { readFile } from './drive';

const PROJECTS = [
  'goldfinch',
  'engen3',
  'squad',
  'metro',
  'genghis',
  'engine-block',
  'robotics',
  'iitr-capstone',
  'simhastha',
];

export type Intent =
  | { kind: 'capture'; text: string }
  | { kind: 'done'; text: string }
  | { kind: 'research'; text: string; project?: string }
  | { kind: 'status'; text: string }
  | { kind: 'chat'; text: string };

export function detectProjects(text: string): string[] {
  const low = text.toLowerCase();
  const aliases: Record<string, string[]> = {
    goldfinch: ['goldfinch', 'phil', 'phil mckenzie'],
    engen3: ['engen3', 'engen', 'jordan', 'fan hub', 'studio backlot', 'ngin'],
    squad: ['squad'],
    metro: ['metro', 'aibe', 'ajo', 'genai studio', 'sonika', 'khaled'],
    genghis: ['genghis', '1989 bible', 'monisha', 'emmay'],
    'engine-block': ['engine block', 'engine-block'],
    robotics: ['robotics', 'robot arm', 'smart glasses', 'arm manipulation'],
    'iitr-capstone': ['iitr', 'iit roorkee', 'capstone', 'policypilot', 'abhishek acharya'],
    simhastha: ['simhastha', 'kumbh', 'ujjain', 'vani'],
  };
  const hits = new Set<string>();
  for (const [proj, keys] of Object.entries(aliases)) {
    if (keys.some((k) => low.includes(k))) hits.add(proj);
  }
  return [...hits];
}

export async function loadBriefs(projects: string[]): Promise<string> {
  if (projects.length === 0) return '';
  const parts: string[] = [];
  for (const proj of projects) {
    try {
      const content = await readFile(`briefs/${proj}.md`);
      parts.push(`\n\n--- BRIEF: ${proj} ---\n${content}`);
    } catch {
      // brief missing — skip silently
    }
  }
  return parts.join('');
}

export async function loadSoul(): Promise<string> {
  return await readFile('config/SOUL.md');
}

export async function loadTasks(): Promise<string> {
  const parts: string[] = [];
  for (const name of ['active', 'week', 'parked']) {
    try {
      const content = await readFile(`tasks/${name}.md`);
      parts.push(`\n\n--- TASKS: ${name} ---\n${content}`);
    } catch {}
  }
  return parts.join('');
}

export async function respond(userText: string, extraContext = ''): Promise<string> {
  const projects = detectProjects(userText);
  const [soul, briefs, tasks] = await Promise.all([
    loadSoul(),
    loadBriefs(projects),
    loadTasks(),
  ]);

  const system = `${soul}

## Current state
${tasks}

${briefs}

${extraContext}`;

  return await chat([
    { role: 'system', content: system },
    { role: 'user', content: userText },
  ]);
}
