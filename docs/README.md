# JS Kit - Docs & Guides

This folder contains guides for getting tokens and running workers.

## Overview
- For Official-mode use official APIs: Telegram Bot API, WhatsApp Business Cloud, Facebook Page / Instagram Business Graph API.
- For Personal-mode, use the client multi-share flow or run a local worker on your device. Automating personal accounts server-side is not provided due to policy and safety reasons.

## Quick guides
1. Upstash Redis: https://upstash.com - create DB and copy REDIS_URL
2. Vercel: create account and deploy server/ folder (vercel deploy or connect to GitHub)
3. Running central worker: set REDIS_URL and run `node worker/worker.js`
4. Telegram Bot: create bot via @BotFather, get token, add bot to groups or channels
5. WhatsApp Business Cloud: follow Meta docs to create app, phone number, and get token (see Meta dev docs)
6. Facebook Page / Instagram Business: create or use existing Page, generate Page access token via Facebook Graph API Explorer or implement OAuth flow
