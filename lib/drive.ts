// Google Drive helpers. Reads briefs, reads/writes task files, appends logs.

import { google } from 'googleapis';
import type { drive_v3 } from 'googleapis';

let driveClient: drive_v3.Drive | null = null;

function getDrive(): drive_v3.Drive {
  if (driveClient) return driveClient;
  const credsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!credsJson) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not set');
  const credentials = JSON.parse(credsJson);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  driveClient = google.drive({ version: 'v3', auth });
  return driveClient;
}

function folderId(): string {
  const id = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!id) throw new Error('GOOGLE_DRIVE_FOLDER_ID not set');
  return id;
}

export async function readFile(relativePath: string): Promise<string> {
  const drive = getDrive();
  const fileId = await resolvePath(relativePath);
  if (!fileId) throw new Error(`File not found: ${relativePath}`);
  const res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'text' });
  return res.data as unknown as string;
}

export async function writeFile(relativePath: string, content: string): Promise<void> {
  const drive = getDrive();
  const existingId = await resolvePath(relativePath);
  const media = { mimeType: 'text/markdown', body: content };

  if (existingId) {
    await drive.files.update({ fileId: existingId, media });
    return;
  }

  const parts = relativePath.split('/');
  const name = parts.pop()!;
  const parent = await ensureFolderPath(parts);
  await drive.files.create({
    requestBody: { name, parents: [parent], mimeType: 'text/markdown' },
    media,
  });
}

export async function appendFile(relativePath: string, chunk: string): Promise<void> {
  let existing = '';
  try {
    existing = await readFile(relativePath);
  } catch {
    existing = '';
  }
  const sep = existing && !existing.endsWith('\n') ? '\n' : '';
  await writeFile(relativePath, existing + sep + chunk);
}

async function resolvePath(relativePath: string): Promise<string | null> {
  const drive = getDrive();
  const parts = relativePath.split('/').filter(Boolean);
  let parentId = folderId();
  for (let i = 0; i < parts.length; i++) {
    const name = parts[i];
    const isLast = i === parts.length - 1;
    const q = `'${parentId}' in parents and name = '${name.replace(/'/g, "\\'")}' and trashed = false`;
    const list = await drive.files.list({ q, fields: 'files(id, mimeType)' });
    const file = list.data.files?.[0];
    if (!file?.id) return null;
    if (isLast) return file.id;
    parentId = file.id;
  }
  return parentId;
}

async function ensureFolderPath(parts: string[]): Promise<string> {
  const drive = getDrive();
  let parentId = folderId();
  for (const name of parts) {
    const q = `'${parentId}' in parents and name = '${name.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    const list = await drive.files.list({ q, fields: 'files(id)' });
    let folder = list.data.files?.[0];
    if (!folder?.id) {
      const created = await drive.files.create({
        requestBody: {
          name,
          parents: [parentId],
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id',
      });
      parentId = created.data.id!;
    } else {
      parentId = folder.id;
    }
  }
  return parentId;
}
