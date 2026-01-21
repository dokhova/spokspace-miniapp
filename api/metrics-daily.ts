import type { VercelRequest, VercelResponse } from "@vercel/node";
import { kv } from "@vercel/kv";

import { applyCors } from "./_lib/cors.js";

function toCounter(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
  }
  return 0;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res, { methods: "GET,OPTIONS" })) return;

  if (req.method !== "GET") {
    res.status(405).json({ ok: false, reason: "method_not_allowed" });
    return;
  }

  res.setHeader("Cache-Control", "no-store");

  const date = new Date();
  const dateKey = date.toISOString().slice(0, 10);

  try {
    const [
      todayTotalRaw,
      todayOpenTodayRaw,
      todayOpenGameRaw,
      todayOpenPracticeRaw,
      todayWebTotalRaw,
      todayWebOpenTodayRaw,
      todayWebOpenGameRaw,
      todayWebOpenPracticeRaw,
      todayTelegramTotalRaw,
      todayTelegramOpenTodayRaw,
      todayTelegramOpenGameRaw,
      todayTelegramOpenPracticeRaw,
    ] = await Promise.all([
      kv.get(`events:byDay:${dateKey}:total`),
      kv.get(`events:byDay:${dateKey}:byEvent:open_today`),
      kv.get(`events:byDay:${dateKey}:byEvent:open_game`),
      kv.get(`events:byDay:${dateKey}:byEvent:open_practice`),
      kv.get(`events:byDay:${dateKey}:byClient:web:total`),
      kv.get(`events:byDay:${dateKey}:byClient:web:byEvent:open_today`),
      kv.get(`events:byDay:${dateKey}:byClient:web:byEvent:open_game`),
      kv.get(`events:byDay:${dateKey}:byClient:web:byEvent:open_practice`),
      kv.get(`events:byDay:${dateKey}:byClient:telegram:total`),
      kv.get(`events:byDay:${dateKey}:byClient:telegram:byEvent:open_today`),
      kv.get(`events:byDay:${dateKey}:byClient:telegram:byEvent:open_game`),
      kv.get(`events:byDay:${dateKey}:byClient:telegram:byEvent:open_practice`),
    ]);

    res.status(200).json({
      date: dateKey,
      today_total: toCounter(todayTotalRaw),
      today_web_total: toCounter(todayWebTotalRaw),
      today_telegram_total: toCounter(todayTelegramTotalRaw),
      today_open_today: toCounter(todayOpenTodayRaw),
      today_open_game: toCounter(todayOpenGameRaw),
      today_open_practice: toCounter(todayOpenPracticeRaw),
      today_web_open_today: toCounter(todayWebOpenTodayRaw),
      today_web_open_game: toCounter(todayWebOpenGameRaw),
      today_web_open_practice: toCounter(todayWebOpenPracticeRaw),
      today_telegram_open_today: toCounter(todayTelegramOpenTodayRaw),
      today_telegram_open_game: toCounter(todayTelegramOpenGameRaw),
      today_telegram_open_practice: toCounter(todayTelegramOpenPracticeRaw),
      generatedAt: date.toISOString(),
    });
  } catch {
    res.status(500).json({ ok: false, reason: "storage_error" });
  }
}
