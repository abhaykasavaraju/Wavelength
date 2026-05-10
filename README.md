# MoodTunes 🎵

A mood-based Spotify playlist generator.

## Setup & Run

```bash
npm install
npm run dev
```

Then open http://127.0.0.1:3000

## How it works

1. Click "Connect with Spotify" and log in
2. Pick a mood
3. Hit "Generate playlist"
4. Preview tracks (30s clips where available)
5. Hit "Save to Spotify" to create the playlist in your account

## Files

- `src/auth.js` — Spotify OAuth PKCE flow (no backend needed)
- `src/spotify.js` — API calls: recommendations, create playlist
- `src/main.js` — App logic and rendering
- `src/style.css` — All styles
