## Daily metrics (aggregated)

**Purpose:** fast counters for dashboards (read-only).

**Endpoint:**
- `GET /api/metrics-daily`

**Response fields:**
- `date` (string) — `YYYY-MM-DD` (UTC, from `new Date().toISOString().slice(0,10)`)
- `today_total` (number)
- `today_web_total` (number)
- `today_telegram_total` (number)

Per-event totals:
- `today_open_today`
- `today_open_game`
- `today_open_practice`

Per-event by client:
- `today_web_open_today`
- `today_web_open_game`
- `today_web_open_practice`
- `today_telegram_open_today`
- `today_telegram_open_game`
- `today_telegram_open_practice`

- `generatedAt` (string) — ISO datetime

**Storage keys (KV):**
- `events:byDay:{date}:total`
- `events:byDay:{date}:byEvent:{event_name}`
- `events:byDay:{date}:byClient:{client}:total`
- `events:byDay:{date}:byClient:{client}:byEvent:{event_name}`

**Notes:**
- Daily metrics date is calculated in UTC (ISO date).
