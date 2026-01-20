import type { VercelRequest, VercelResponse } from "@vercel/node";
import { kv } from "@vercel/kv";
import { z } from "zod";

import { applyCors } from "./_lib/cors.js";

const EventSchema = z
  .object({
    event: z.string().min(1),
    ts: z.union([z.number(), z.string()]).optional(),
    utm: z
      .object({
        source: z.string().min(1).optional(),
        campaign: z.string().min(1).optional(),
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res, { methods: "GET,POST,OPTIONS" })) return;

  if (req.method === "GET") {
    res.setHeader("Cache-Control", "no-store");

    const dateKey = new Date().toISOString().slice(0, 10);
    try {
      const [lastEvents, sourceAgg, campaignAgg] = await Promise.all([
        loadRecentEvents(dateKey),
        loadAgg("utm_source", dateKey),
        loadAgg("utm_campaign", dateKey),
      ]);

      res.status(200).json({
        ok: true,
        ts: new Date().toISOString(),
        lastEvents,
        utmAgg: {
          source: sourceAgg,
          campaign: campaignAgg,
          medium: {},
        },
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
  const dateKey = getDateKey(payload);
  const rawEvent = JSON.stringify(payload);

  try {
    const ops: Array<Promise<number>> = [kv.lpush(`events:${dateKey}`, rawEvent)];

    const source = payload.utm?.source?.trim();
    if (source) ops.push(kv.incr(`utm_source:${source}:${dateKey}`));

    const campaign = payload.utm?.campaign?.trim();
    if (campaign) ops.push(kv.incr(`utm_campaign:${campaign}:${dateKey}`));

    await Promise.all(ops);
  } catch {
    res.status(500).json({ ok: false, reason: "storage_error" });
    return;
  }

  res.status(200).json({ ok: true });
}
