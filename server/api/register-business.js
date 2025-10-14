/**
 * WARNING:
 * This endpoint is optional for users who want to store Business tokens for official-mode.
 * In production, never store raw tokens unencrypted. This file is a placeholder.
 * Use Vercel environment variables / a secure vault or implement encryption before storing tokens.
 */
import fs from 'fs/promises';
import path from 'path';

const DB = path.join('/tmp','business_tokens.json');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { userId, platform, token, meta } = req.body || {};
    if (!userId || !platform || !token) return res.status(400).json({ error: 'userId, platform, token required' });

    let db = {};
    try { db = JSON.parse(await fs.readFile(DB, 'utf8')); } catch(e){ db = {}; }
    db[userId] = db[userId]||{};
    db[userId][platform] = { token, meta, addedAt: new Date().toISOString() };
    await fs.writeFile(DB, JSON.stringify(db, null, 2));

    return res.json({ status: 'stored (demo only - do not use in production)' });
  } catch(err) {
    console.error(err);
    return res.status(500).json({ error: 'internal' });
  }
}
