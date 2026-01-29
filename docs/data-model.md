# Data model (Spokspace)

## Source of truth
Backend (KV) is the source of truth.
Google Sheets is a read-only dashboard.

---

## Events (raw)

**Purpose:** store user interactions for debugging and simple funnels.

**Fields:**
- `event_name` (string) — e.g. `open_app`, `add_habit`, `specialist_more`
- `client` (string) — `web` | `telegram`
- `ts` (number) — unix timestamp (ms)
- `day` (string) — `YYYY-MM-DD` in user timezone
- `utm_source` (string | null)
- `utm_medium` (string | null)
- `payload` (object | null) — optional metadata

**Storage:**
- KV list: keep last N events (e.g. 200) for debug

---

## Daily metrics (aggregated)

**Purpose:** fast counters for dashboards and reporting.

**Fields (per day):**
- `day` (string) — `YYYY-MM-DD`
- `total` (number)
- `web_total` (number)
- `telegram_total` (number)
- `utm_source_*` (number) — counters by source
- `utm_medium_*` (number) — counters by medium
- `generatedAt` (string) — ISO datetime of last update

**Storage:**
- KV hash/object per day (or per metric key)

---

## Notes
- Day is calculated by user timezone (not UTC).
- Sheets should not calculate anything, only read `/api/metrics-daily`.
