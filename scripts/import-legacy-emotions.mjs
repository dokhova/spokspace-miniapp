#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { kv } from "@vercel/kv";

const EMOTIONS_PATH = path.resolve("data/legacy/emotions.csv");
const BEST_SCORES_PATH = path.resolve("data/legacy/best_scores.csv");

const COLUMN_VARIANTS = {
  user_id: ["user_id", "userId", "userid", "tg_user_id", "tgUserId"],
  date_key: ["date_key", "dateKey", "date", "day"],
  emotion: ["emotion", "emotion_key", "emotionKey", "emotion_id", "emotionId"],
  score: ["score", "value", "points", "best_score", "bestScore"],
  created_at: ["created_at", "createdAt", "ts", "timestamp", "time", "created"],
  platform: ["platform", "source"],
};

function usage() {
  console.error("Usage: node scripts/import-legacy-emotions.mjs --dry-run | --apply");
  process.exit(1);
}

function normalizeHeader(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function detectDelimiter(line) {
  const candidates = [",", ";", "\t", "|"];
  let best = ",";
  let bestCount = -1;
  for (const delimiter of candidates) {
    const count = line.split(delimiter).length - 1;
    if (count > bestCount) {
      bestCount = count;
      best = delimiter;
    }
  }
  return best;
}

function parseCsv(text, delimiter) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        const next = text[i + 1];
        if (next === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === delimiter) {
      row.push(field);
      field = "";
      continue;
    }

    if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") {
        i += 1;
      }
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
      continue;
    }

    field += char;
  }

  row.push(field);
  rows.push(row);
  return rows;
}

function findColumnIndex(headers, variants, required) {
  const normalizedHeaders = headers.map(normalizeHeader);
  const normalizedVariants = variants.map(normalizeHeader);
  for (const variant of normalizedVariants) {
    const index = normalizedHeaders.indexOf(variant);
    if (index !== -1) return index;
  }

  if (required) {
    const found = headers.map((value) => value.trim()).filter(Boolean);
    const missing = variants.join("/");
    throw new Error(
      `Missing required column: ${missing}. Found columns: ${found.length ? found.join(", ") : "<none>"}`
    );
  }

  return -1;
}

function toNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const numeric = Number(String(value).trim());
  if (Number.isFinite(numeric)) return numeric;
  return null;
}

function parseDateInput(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    const ms = value < 1_000_000_000_000 ? value * 1000 : value;
    return new Date(ms);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const numeric = Number(trimmed);
    if (Number.isFinite(numeric)) {
      const ms = numeric < 1_000_000_000_000 ? numeric * 1000 : numeric;
      return new Date(ms);
    }

    const parsed = Date.parse(trimmed);
    if (!Number.isNaN(parsed)) return new Date(parsed);
  }

  return null;
}

function normalizeCreatedAt(value, dateKey) {
  const parsed = parseDateInput(value);
  if (parsed) return parsed.toISOString();
  if (dateKey) return new Date(`${dateKey}T00:00:00.000Z`).toISOString();
  return new Date().toISOString();
}

function normalizeDateKey(value) {
  if (value == null) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return isoMatch[0];

  const dottedMatch = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dottedMatch) {
    const [, day, month, year] = dottedMatch;
    return `${year}-${month}-${day}`;
  }

  const parsed = Date.parse(trimmed);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toISOString().slice(0, 10);
  }

  return null;
}

function isEmptyRow(row) {
  return row.every((value) => !String(value ?? "").trim());
}

async function readCsv(filePath) {
  const raw = await readFile(filePath, "utf8");
  const content = raw.replace(/^\uFEFF/, "");
  const firstLine = content.split(/\r?\n/).find((line) => line.trim()) ?? "";
  const delimiter = detectDelimiter(firstLine);
  const rows = parseCsv(content, delimiter).filter((row) => !isEmptyRow(row));

  if (!rows.length) {
    throw new Error(`CSV file ${filePath} is empty.`);
  }

  const headers = rows.shift();
  if (!headers) {
    throw new Error(`CSV file ${filePath} does not contain headers.`);
  }

  return { headers, rows };
}

async function importEmotions({ apply }) {
  const stats = { processed: 0, imported: 0, skipped: 0, warnings: 0 };
  const { headers, rows } = await readCsv(EMOTIONS_PATH);

  const userIdIndex = findColumnIndex(headers, COLUMN_VARIANTS.user_id, true);
  const dateKeyIndex = findColumnIndex(headers, COLUMN_VARIANTS.date_key, true);
  const emotionIndex = findColumnIndex(headers, COLUMN_VARIANTS.emotion, true);
  const scoreIndex = findColumnIndex(headers, COLUMN_VARIANTS.score, false);
  const createdAtIndex = findColumnIndex(headers, COLUMN_VARIANTS.created_at, false);
  const platformIndex = findColumnIndex(headers, COLUMN_VARIANTS.platform, false);

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const rowNumber = i + 2;
    stats.processed += 1;

    const rawUserId = String(row[userIdIndex] ?? "").trim();
    if (!rawUserId || !rawUserId.startsWith("tg_")) {
      console.warn(`[emotions] Row ${rowNumber}: invalid user_id "${rawUserId}", skipping.`);
      stats.warnings += 1;
      stats.skipped += 1;
      continue;
    }

    const dateKey = normalizeDateKey(row[dateKeyIndex]);
    if (!dateKey) {
      console.warn(`[emotions] Row ${rowNumber}: invalid date_key "${row[dateKeyIndex]}", skipping.`);
      stats.warnings += 1;
      stats.skipped += 1;
      continue;
    }

    const emotion = String(row[emotionIndex] ?? "").trim();
    if (!emotion) {
      console.warn(`[emotions] Row ${rowNumber}: empty emotion, skipping.`);
      stats.warnings += 1;
      stats.skipped += 1;
      continue;
    }

    if (scoreIndex !== -1) {
      const scoreValue = toNumber(row[scoreIndex]);
      if (scoreValue == null) {
        console.warn(`[emotions] Row ${rowNumber}: invalid score "${row[scoreIndex]}", skipping.`);
        stats.warnings += 1;
        stats.skipped += 1;
        continue;
      }
    }

    const createdAtRaw = createdAtIndex !== -1 ? row[createdAtIndex] : null;
    const platformRaw = platformIndex !== -1 ? String(row[platformIndex] ?? "").trim() : "";

    const record = {
      user_id: rawUserId,
      date_key: dateKey,
      emotion,
      created_at: normalizeCreatedAt(createdAtRaw, dateKey),
      platform: platformRaw || "legacy-csv",
    };

    if (apply) {
      await Promise.all([
        kv.set(`emo:${rawUserId}:${dateKey}`, record),
        kv.sadd(`emo_idx:${rawUserId}`, dateKey),
      ]);
    }

    stats.imported += 1;
  }

  return stats;
}

async function importBestScores({ apply }) {
  const stats = { processed: 0, imported: 0, skipped: 0, warnings: 0 };
  const { headers, rows } = await readCsv(BEST_SCORES_PATH);

  const userIdIndex = findColumnIndex(headers, COLUMN_VARIANTS.user_id, true);
  const scoreIndex = findColumnIndex(headers, COLUMN_VARIANTS.score, true);

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const rowNumber = i + 2;
    stats.processed += 1;

    const rawUserId = String(row[userIdIndex] ?? "").trim();
    if (!rawUserId || !rawUserId.startsWith("tg_")) {
      console.warn(`[best_scores] Row ${rowNumber}: invalid user_id "${rawUserId}", skipping.`);
      stats.warnings += 1;
      stats.skipped += 1;
      continue;
    }

    const scoreValue = toNumber(row[scoreIndex]);
    if (scoreValue == null) {
      console.warn(`[best_scores] Row ${rowNumber}: invalid score "${row[scoreIndex]}", skipping.`);
      stats.warnings += 1;
      stats.skipped += 1;
      continue;
    }

    if (apply) {
      const currentRaw = await kv.get(`best:${rawUserId}`);
      const currentValue = toNumber(currentRaw) ?? 0;
      const nextValue = Math.max(currentValue, scoreValue);
      await kv.set(`best:${rawUserId}`, nextValue);
    }

    stats.imported += 1;
  }

  return stats;
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const isDryRun = args.has("--dry-run");
  const isApply = args.has("--apply");

  if ((isDryRun && isApply) || (!isDryRun && !isApply)) {
    usage();
  }

  const apply = isApply;

  console.info(`[legacy-import] mode: ${apply ? "apply" : "dry-run"}`);

  const emotionsStats = await importEmotions({ apply });
  const bestScoresStats = await importBestScores({ apply });

  const total = {
    processed: emotionsStats.processed + bestScoresStats.processed,
    imported: emotionsStats.imported + bestScoresStats.imported,
    skipped: emotionsStats.skipped + bestScoresStats.skipped,
    warnings: emotionsStats.warnings + bestScoresStats.warnings,
  };

  console.info("[legacy-import] emotions", emotionsStats);
  console.info("[legacy-import] best_scores", bestScoresStats);
  console.info("[legacy-import] total", total);
}

main().catch((error) => {
  console.error(`[legacy-import] failed: ${error.message}`);
  process.exit(1);
});
