# Worker - Central

This worker listens to Upstash/BullMQ queue and processes jobs for official-mode platforms.
Run in Termux or a server (Railway/Render).

ENV:
  REDIS_URL - Upstash Redis connection string
  TELEGRAM_BOT_TOKEN - (optional global default)
  WA_PHONE_NUMBER_ID - (optional)
  WA_TOKEN - (optional)
  FB_PAGE_TOKEN - (optional)

Install & run:
  cd worker
  npm install
  export REDIS_URL="rediss://default:..."
  node worker.js
