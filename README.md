# Spokspace Miniapp

A Telegram Mini App for short breathing and meditation practices with a lightweight mood check-in flow, designed for quick sessions on mobile.

## Features

- Practices library (breathing + meditation) with short audio sessions.
- Practice player with breathing cycles and guided audio.
- RU/EN интерфейс (i18n).
- Mood check-in calendar stored in localStorage.
- Calm Dots mini-game with best score tracking.
- Telegram WebApp integration (user profile + header/background setup).
- Responsive layout optimized for Telegram Mini Apps.
- Optional analytics IDs via env (GA4 + Telegram Analytics).

## Tech stack

React, TypeScript, Vite, react-router-dom, ESLint.

## Quick start

```
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

Build:

```
npm run build
```

## Environment variables

See `.env.example`.

- `VITE_GA_MEASUREMENT_ID` (optional)
- `VITE_TELEGRAM_ANALYTICS_TOKEN` (optional)
- `MIGRATION_TOKEN` (required for migration API routes)

## KV migration (CSV -> JSON)

Emotions:

```bash
curl -X POST "https://<your-vercel-domain>/api/migrate/emotions" \
  -H "Authorization: Bearer $MIGRATION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{"user_id":"tg_123","date_key":"2024-01-01","emotion":"calm","created_at":"2024-01-01T10:00:00Z","platform":"telegram"}]'
```

Best scores:

```bash
curl -X POST "https://<your-vercel-domain>/api/migrate/best-scores" \
  -H "Authorization: Bearer $MIGRATION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{"user_id":"tg_123","best_score":42}]'
```

## Legacy CSV import

CSV files are expected at:

- `data/legacy/emotions.csv`
- `data/legacy/best_scores.csv`

Required env variables for KV access:

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

Dry run (no KV writes):

```bash
node scripts/import-legacy-emotions.mjs --dry-run
```

Apply import:

```bash
node scripts/import-legacy-emotions.mjs --apply
```

Verify via API after `--apply`:

```bash
curl "https://<your-vercel-domain>/api/emotions?user_id=tg_test&from=2024-01-01&to=2024-01-31"
```

## Project structure

- `src/pages` — pages and screens.
- `src/pages/practices` — practice config and player screens.
- `src/i18n` — language data and helpers.
- `src/styles` — global and page styles.
- `public/img` — images and icons.
- `public/audio` — practice audio assets.

## How to add a new practice

1. Add a new entry in `src/pages/practices/practiceConfig.ts` with a unique `slug`, `title`, `subtitle`, `tags`, and `audio`.
2. Add preview images to `public/img` and audio files to `public/audio`.
3. Update the `other` list for related cards where needed.
4. Run `npm run dev` and open `/practice/<slug>` and `/practice/<slug>/play` to verify content.

## Scripts

- `npm run dev` — start local dev server.
- `npm run build` — typecheck and build for production.
- `npm run lint` — run ESLint.
- `npm run preview` — preview the production build.

## License

MIT.
