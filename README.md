# JS Kit - Full Repository (Generated)

This repository implements JS Kit: a cross-platform link-sharing broadcast system.
It supports two modes:
- Official-mode: uses official APIs (Telegram Bot, WhatsApp Business Cloud, Facebook Page/Instagram Business) and central worker to send messages.
- Personal-mode: user-hosted/share-intent mode; the client prepares messages and opens target apps for the user to confirm sending (human-in-loop).

Important: This project avoids automating personal accounts from central servers to comply with platform policies. Local automation is left to advanced users on their own devices (Termux) with explicit warnings and opt-in.

Folders:
- server/: Vercel API (enqueue, register-business, job-status)
- worker/: central worker (telegram, wa-business, fb/ig placeholders)
- client/: Expo client app with personal-mode and official-mode enqueue
- docs/: guides & links

Next steps:
1. Create Upstash Redis and set REDIS_URL in Vercel and worker
2. Deploy server/ to Vercel
3. Run worker/ centrally (Railway/Render/Termux) for official-mode sending
4. Use client/ to create link groups and send via personal-mode or official-mode

If you'd like, I can continue by:
- Adding OAuth helper flows for Facebook/Instagram (requires App ID/secret)
- Making the client a full multi-screen app with login and persistent storage
- Implementing token encryption & secure storage on server
