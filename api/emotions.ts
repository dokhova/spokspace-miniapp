import type { VercelRequest, VercelResponse } from "@vercel/node";
import { kv } from "@vercel/kv";
import { z } from "zod";

import { applyCors } from "./_lib/cors.js";

const UserIdSchema = z.string().regex(/^tg_.+$/, "user_id must start with tg_");
const DateKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date_key must be YYYY-MM-DD");
const EmotionSchema = z.string().min(1, "emotion must be non-empty");

const EmotionPayloadSchema = z.object({
  user_id: UserIdSchema,
  date_key: DateKeySchema,
  emotion: EmotionSchema,
  created_at: z.union([z.string(), z.number()]).optional(),
  platform: z.string().optional(),
});

const EmotionsQuerySchema = z.object({
  user_id: UserIdSchema,
  from: DateKeySchema,
  to: DateKeySchema,
});

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

function getQueryParam(value: string | string[] | undefined): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (Array.isArray(value) && value[0]?.trim()) return value[0].trim();
  return null;
}

function parseDateInput(value: unknown): Date | null {
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

function normalizeCreatedAt(value: unknown): string {
  const parsed = parseDateInput(value);
  return (parsed ?? new Date()).toISOString();
}

function parseStoredRecord(value: unknown): unknown | null {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (value && typeof value === "object") return value;
  return null;
}

function toDateKeyList(values: string[], from: string, to: string): string[] {
  return values
    .filter((dateKey) => dateKey >= from && dateKey <= to)
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res, { methods: "GET,POST,OPTIONS" })) return;

  if (req.method === "GET") {
    res.setHeader("Cache-Control", "no-store");

    const query = EmotionsQuerySchema.safeParse({
      user_id: getQueryParam(req.query.user_id),
      from: getQueryParam(req.query.from),
      to: getQueryParam(req.query.to),
    });

    if (!query.success) {
      res.status(400).json({ ok: false, reason: "invalid_query", issues: query.error.issues });
      return;
    }

    const { user_id, from, to } = query.data;
    if (from > to) {
      res.status(400).json({ ok: false, reason: "invalid_range" });
      return;
    }

    try {
      const dateKeys = await kv.smembers<string>(`emo_idx:${user_id}`);
      if (!dateKeys.length) {
        res.status(200).json({ user_id, records: [] });
        return;
      }

      const filtered = toDateKeyList(dateKeys, from, to);
      if (!filtered.length) {
        res.status(200).json({ user_id, records: [] });
        return;
      }

      const keys = filtered.map((dateKey) => `emo:${user_id}:${dateKey}`);
      const values = await kv.mget(...keys);
      const records = values
        .map(parseStoredRecord)
        .filter((record): record is Record<string, unknown> => record !== null);

      res.status(200).json({ user_id, records });
    } catch {
      res.status(500).json({ ok: false, reason: "storage_error" });
    }
    return;
  }

  if (req.method === "POST") {
    const payload = EmotionPayloadSchema.safeParse(extractJsonBody(req));
    if (!payload.success) {
      res.status(400).json({ ok: false, reason: "invalid_payload", issues: payload.error.issues });
      return;
    }

    const { user_id, date_key, emotion, created_at, platform } = payload.data;
    const record = {
      user_id,
      date_key,
      emotion,
      created_at: normalizeCreatedAt(created_at),
      platform: platform ?? null,
    };

    try {
      await Promise.all([
        kv.set(`emo:${user_id}:${date_key}`, record),
        kv.sadd(`emo_idx:${user_id}`, date_key),
      ]);
      res.status(200).json({ ok: true, record });
    } catch {
      res.status(500).json({ ok: false, reason: "storage_error" });
    }
    return;
  }

  res.status(405).json({ ok: false, reason: "method_not_allowed" });
}
