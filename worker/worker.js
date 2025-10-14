import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import fetch from 'node-fetch';
import pLimit from 'p-limit';

const REDIS_URL = process.env.REDIS_URL;
if (!REDIS_URL) {
  console.error('REDIS_URL not set. Exiting.');
  process.exit(1);
}
const connection = new IORedis(REDIS_URL);

const limit = pLimit(1); // limit concurrency per worker process

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function sendTelegram(botToken, chatId, text) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
  });
  return res.json();
}

async function sendWhatsAppBusiness(phoneNumberId, token, to, text) {
  const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text }
  };
  const res = await fetch(url, { method: 'POST', headers: { Authorization: 'Bearer '+token, 'Content-Type':'application/json' }, body: JSON.stringify(body) });
  return res.json();
}

async function sendFacebookPage(pageToken, pageId, message) {
  const url = `https://graph.facebook.com/${pageId}/feed`;
  const res = await fetch(url, { method: 'POST', headers: { Authorization: 'Bearer '+pageToken, 'Content-Type':'application/json' }, body: JSON.stringify({ message }) });
  return res.json();
}

async function processJob(job) {
  const payload = job.data;
  console.log('Process job', payload.platform, 'mode', payload.mode);
  const results = [];
  const textForTargets = payload.links.map((l,i)=>`[${i+1}] ${l}`).join('\n');

  if (payload.mode === 'official') {
    // attempt official APIs based on platform
    if (payload.platform === 'telegram') {
      // require bot token per user (demo: read from env or job.meta)
      const botToken = process.env.TELEGRAM_BOT_TOKEN || (payload.meta && payload.meta.botToken);
      if (!botToken) throw new Error('No bot token');
      for (const t of payload.targets) {
        await limit(() => sendTelegram(botToken, t.chatId, textForTargets).then(r=>results.push({target:t,resp:r})).catch(e=>results.push({target:t,error:String(e)})));
        await sleep(payload.rateLimit?.delay || 1000);
      }
    } else if (payload.platform === 'whatsapp') {
      const phoneId = process.env.WA_PHONE_NUMBER_ID || (payload.meta && payload.meta.phoneNumberId);
      const token = process.env.WA_TOKEN || (payload.meta && payload.meta.waToken);
      if (!phoneId || !token) throw new Error('WhatsApp business credentials missing');
      for (const t of payload.targets) {
        await limit(() => sendWhatsAppBusiness(phoneId, token, t.to, textForTargets).then(r=>results.push({target:t,resp:r})).catch(e=>results.push({target:t,error:String(e)})));
        await sleep(payload.rateLimit?.delay || 2000);
      }
    } else if (payload.platform === 'facebook' || payload.platform === 'instagram') {
      const pageToken = process.env.FB_PAGE_TOKEN || (payload.meta && payload.meta.pageToken);
      const pageId = (payload.meta && payload.meta.pageId);
      if (!pageToken || !pageId) throw new Error('FB page credentials missing');
      for (const t of payload.targets) {
        await limit(() => sendFacebookPage(pageToken, pageId, textForTargets).then(r=>results.push({target:t,resp:r})).catch(e=>results.push({target:t,error:String(e)})));
        await sleep(payload.rateLimit?.delay || 3000);
      }
    } else {
      throw new Error('Unknown platform');
    }
  } else if (payload.mode === 'personal') {
    console.log('Personal-mode job queued for local client processing. Not sending from central worker.');
    results.push({ status: 'personal_mode_ready' });
  } else {
    throw new Error('Unknown mode');
  }

  return { ok:true, results };
}

const worker = new Worker('broadcast', async job => {
  try {
    const out = await processJob(job);
    console.log('Job completed', job.id);
    return out;
  } catch(err) {
    console.error('Job failed', job.id, err);
    throw err;
  }
}, { connection });

worker.on('completed', job => console.log('✅ completed', job.id));
worker.on('failed', (job, err) => console.error('❌ failed', job.id, err && err.message));
