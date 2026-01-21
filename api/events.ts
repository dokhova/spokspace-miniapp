import type { VercelRequest, VercelResponse } from "@vercel/node";
import { kv } from "@vercel/kv";
import { z } from "zod";

import { applyCors } from "./_lib/cors.js";

const EventSchema = z
  .object({
    event: z.string().min(1),
    ts: z.union([z.number(), z.string()]).optional(),
    client: z.string().optional(),
    utm: z
      .object({
        source: z.string().min(1).optional(),
        campaign: z.string().min(1).optional(),
        medium: z.string().min(1).optional(),
      })
      .catchall(z.unknown())
      .optional(),
    user: z.unknown().optional(),
    session: z.unknown().optional(),
    meta: z.unknown().optional(),
  })
  .passthrough();

type EventPayload = z.infer<typeof EventSchema>;

function extractJsonBody(req: VercelRequest): unknown {
  if (req.body == null) return null;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }
  return req.body;
}

function toDate(value: unknown): Date {
  if (typeof value === "number" && Number.isFinite(value)) {
    const ms = value < 1_000_000_000_000 ? value * 1000 : value;
    return new Date(ms);
  }

  if (typeof value === "string") {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      const ms = numeric < 1_000_000_000_000 ? numeric * 1000 : numeric;
      return new Date(ms);
    }

    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return new Date(parsed);
  }

  return new Date();
}

function getDateKey(payload: EventPayload): string {
  const tsDate = payload.ts ? toDate(payload.ts) : new Date();
  return tsDate.toISOString().slice(0, 10);
}

async function loadRecentEvents(dateKey: string): Promise<unknown[]> {
  const items = await kv.lrange<string>(`events:${dateKey}`, 0, 19);
  return items
    .map((item) => {
      try {
        return JSON.parse(item);
      } catch {
        return null;
      }
    })
    .filter((item): item is unknown => item !== null);
}

async function loadAgg(prefix: string, dateKey: string): Promise<Record<string, number>> {
  const keys = await kv.keys(`${prefix}:*:${dateKey}`);
  if (!keys.length) return {};
  const values = await kv.mget<number>(...keys);
  const result: Record<string, number> = {};
  keys.forEach((key, index) => {
    const parts = key.split(":");
    const name = parts[1];
    const value = values[index];
    if (name && typeof value === "number") {
      result[name] = value;
    }
  });
  return result;
}

function toCounter(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
  }
  return 0;
}

function sanitizeEventName(value: string): string {
  return value
    .trim()
    .replace(/[^\w-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
}

function normalizeClient(value: unknown): "web" | "telegram" {
  return value === "telegram" ? "telegram" : "web";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res, { methods: "GET,POST,OPTIONS" })) return;

  if (req.method === "GET") {
    res.setHeader("Cache-Control", "no-store");

    const dateKey = new Date().toISOString().slice(0, 10);
    try {
      const [
        lastEvents,
        sourceAgg,
        campaignAgg,
        mediumAgg,
        totalRaw,
        openTodayRaw,
        openGameRaw,
        openPracticeRaw,
        webTotalRaw,
        webOpenTodayRaw,
        webOpenGameRaw,
        webOpenPracticeRaw,
        telegramTotalRaw,
        telegramOpenTodayRaw,
        telegramOpenGameRaw,
        telegramOpenPracticeRaw,
      ] = await Promise.all([
        loadRecentEvents(dateKey),
        loadAgg("utm_source", dateKey),
        loadAgg("utm_campaign", dateKey),
        loadAgg("utm_medium", dateKey),
        kv.get("events:total"),
        kv.get("events:byEvent:open_today"),
        kv.get("events:byEvent:open_game"),
        kv.get("events:byEvent:open_practice"),
        kv.get("events:byClient:web:total"),
        kv.get("events:byClient:web:byEvent:open_today"),
        kv.get("events:byClient:web:byEvent:open_game"),
        kv.get("events:byClient:web:byEvent:open_practice"),
        kv.get("events:byClient:telegram:total"),
        kv.get("events:byClient:telegram:byEvent:open_today"),
        kv.get("events:byClient:telegram:byEvent:open_game"),
        kv.get("events:byClient:telegram:byEvent:open_practice"),
      ]);
      const totalEvents = toCounter(totalRaw);
      const eventCounts = {
        open_today: toCounter(openTodayRaw),
        open_game: toCounter(openGameRaw),
        open_practice: toCounter(openPracticeRaw),
      };
      const clientCounts = {
        web: {
          total: toCounter(webTotalRaw),
          open_today: toCounter(webOpenTodayRaw),
          open_game: toCounter(webOpenGameRaw),
          open_practice: toCounter(webOpenPracticeRaw),
        },
        telegram: {
          total: toCounter(telegramTotalRaw),
          open_today: toCounter(telegramOpenTodayRaw),
          open_game: toCounter(telegramOpenGameRaw),
          open_practice: toCounter(telegramOpenPracticeRaw),
        },
      };

      res.status(200).json({
        ok: true,
        now: new Date().toISOString(),
        lastEvents,
        utmAgg: {
          source: sourceAgg,
          campaign: campaignAgg,
          medium: mediumAgg,
        },
        totalEvents,
        eventCounts,
        clientCounts,
      });
    } catch {
      res.status(500).json({ ok: false, reason: "storage_error" });
    }
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, reason: "method_not_allowed" });
    return;
  }

  const body = extractJsonBody(req);
  const parsed = EventSchema.safeParse(body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, reason: "invalid_body" });
    return;
  }

  const payload = parsed.data;
  const client = normalizeClient(payload.client);
  const dateKey = getDateKey(payload);
  const rawEvent = JSON.stringify({ ...payload, client });

  try {
    const eventsKey = `events:${dateKey}`;
    const totalEventsPromise = kv.incr("events:total");
    const safeEventName = sanitizeEventName(payload.event);
    const eventKey = safeEventName ? `events:byEvent:${safeEventName}` : null;
    const clientTotalKey = `events:byClient:${client}:total`;
    const clientEventKey = safeEventName
      ? `events:byClient:${client}:byEvent:${safeEventName}`
      : null;
    const ops: Array<Promise<number>> = [
      kv.lpush(eventsKey, rawEvent),
      totalEventsPromise,
      kv.incr(clientTotalKey),
    ];
    if (eventKey) ops.push(kv.incr(eventKey));
    if (clientEventKey) ops.push(kv.incr(clientEventKey));

    const source = payload.utm?.source?.trim();
    const sourceKey = source ? `utm_source:${source}:${dateKey}` : null;
    if (sourceKey) ops.push(kv.incr(sourceKey));

    const campaign = payload.utm?.campaign?.trim();
    const campaignKey = campaign ? `utm_campaign:${campaign}:${dateKey}` : null;
    if (campaignKey) ops.push(kv.incr(campaignKey));

    const medium = payload.utm?.medium?.trim();
    const mediumKey = medium ? `utm_medium:${medium}:${dateKey}` : null;
    if (mediumKey) ops.push(kv.incr(mediumKey));

    console.log("events:post", {
      dateKey,
      sourceKey,
      campaignKey,
      mediumKey,
    });

    await Promise.all(ops);
    await kv.ltrim(eventsKey, 0, 199);
    const totalEvents = await totalEventsPromise;
    res.status(200).json({ ok: true, totalEvents });
    return;
  } catch {
    res.status(500).json({ ok: false, reason: "storage_error" });
    return;
  }
}
