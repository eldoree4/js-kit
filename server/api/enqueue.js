import { Queue } from "bullmq";
import IORedis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;
if (!REDIS_URL) console.warn("REDIS_URL not set. Use Upstash Redis and set REDIS_URL in Vercel.");

const connection = REDIS_URL ? new IORedis(REDIS_URL) : null;
const queue = connection ? new Queue("broadcast", { connection }) : null;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const body = req.body || {};
    const { userId, mode, platform, links, targets, rateLimit } = body;
    if (!platform || !links || !Array.isArray(links) || links.length === 0) {
      return res.status(400).json({ error: 'platform and links[] are required' });
    }
    if (!queue) return res.status(500).json({ error: 'Queue not configured (REDIS_URL missing)' });

    const payload = { userId: userId || 'anonymous', mode: mode || 'personal', platform, links, targets: targets || [], rateLimit: rateLimit || {} };

    await queue.add('broadcast-job', payload, { attempts: 5, backoff: { type: 'exponential', delay: 1000 } });

    return res.json({ status: 'queued' });
  } catch (err) {
    console.error('enqueue error', err);
    return res.status(500).json({ error: 'internal' });
  }
}
