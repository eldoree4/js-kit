import fs from 'fs/promises';
import path from 'path';
const LOGS = path.join('/tmp','broadcast_logs.json');

export default async function handler(req, res) {
  const id = req.query.id;
  try {
    let db = {};
    try { db = JSON.parse(await fs.readFile(LOGS,'utf8')); } catch(e){ db = {}; }
    if (id) return res.json(db[id] || { status: 'not found' });
    return res.json(db);
  } catch(err) {
    console.error(err);
    return res.status(500).json({ error: 'internal' });
  }
}
