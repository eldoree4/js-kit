# JS Kit Client (Expo)

This mobile client implements:
- link grouping
- targets management
- official-mode enqueue (calls server /api/enqueue)
- personal-mode multi-share flow (opens target apps with prefilled message and requires user to press SEND)

Setup:
1. Install expo: `npm install -g expo-cli`
2. Install deps: `npm install`
3. Edit API_ENQUEUE constant in App.js to point to your deployed server URL
4. Run: `expo start`

Notes:
- Personal-mode uses share URLs (wa.me, t.me, facebook sharer). It does NOT send messages automatically from server.
- Official-mode requires business tokens / page tokens to be configured on server or via register endpoint.
