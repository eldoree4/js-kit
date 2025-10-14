# Server (Vercel) - JS Kit

This server contains simple queueing endpoints for broadcast jobs.
**Important**: This demo stores business tokens in /tmp (not persistent) — do not use as-is in production.
Production: use a secure vault (KMS) or Vercel environment variables and never store raw tokens unencrypted.

ENV:
  REDIS_URL - Upstash Redis connection string (rediss://...)

Endpoints:
  POST /api/enqueue        - enqueue job (platform, links[], targets[], userId, mode)
  POST /api/register-business - (demo) store business token for user (not secure)
  GET  /api/job-status?id=...  - view logs/status (demo)
