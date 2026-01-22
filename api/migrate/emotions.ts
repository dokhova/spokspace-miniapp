import type { VercelRequest, VercelResponse } from "@vercel/node";
import { kv } from "@vercel/kv";
import { z } from "zod";

import { applyCors } from "../_lib/cors.js";

const UserIdSchema = z.string().regex(/^tg_.+$/, "user_id must start with tg_");
const DateKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date_key must be YYYY-MM-DD");
const EmotionSchema = z.string().min(1, "emotion must be non-empty");

const MigrationEmotionSchema = z.object({
  user_id: UserIdSchema,
  date_key: DateKeySchema,
  emotion: EmotionSchema,
  created_at: z.union([z.string(), z.number()]).optional(),
  platform: z.string().optional(),
});

const MigrationPayloadSchema = z.array(MigrationEmotionSchema);

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

function extractBearerToken(req: VercelRequest): string | null {
  const headerValue = req.headers.authorization;
  if (typeof headerValue !== "string") return null;
  const token = headerValue.split(" ").pop();
  return token?.trim() ?? null;
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (
    applyCors(req, res, {
      methods: "POST,OPTIONS",
      headers: "Content-Type, X-Requested-With, Authorization",
    })
  ) {
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, reason: "method_not_allowed" });
    return;
  }

  const migrationToken = process.env.MIGRATION_TOKEN;
  if (!migrationToken) {
    res.status(500).json({ ok: false, reason: "missing_MIGRATION_TOKEN" });
    return;
  }

  const token = extractBearerToken(req);
  if (!token || token !== migrationToken) {
    res.status(401).json({ ok: false, reason: "unauthorized" });
    return;
  }

  try {
    const alreadyMigrated = await kv.get<boolean>("migrated:emotions");
    if (alreadyMigrated) {
      res.status(409).json({ ok: false, reason: "already_migrated" });
      return;
    }
  } catch {
    res.status(500).json({ ok: false, reason: "storage_error" });
    return;
  }

  const payload = MigrationPayloadSchema.safeParse(extractJsonBody(req));
  if (!payload.success) {
    res.status(400).json({ ok: false, reason: "invalid_payload", issues: payload.error.issues });
    return;
  }

  const records = payload.data;

  try {
    for (const item of records) {
      const record = {
        user_id: item.user_id,
        date_key: item.date_key,
        emotion: item.emotion,
        created_at: normalizeCreatedAt(item.created_at),
        platform: item.platform ?? null,
      };

      await Promise.all([
        kv.set(`emo:${item.user_id}:${item.date_key}`, record),
        kv.sadd(`emo_idx:${item.user_id}`, item.date_key),
      ]);
    }

    await kv.set("migrated:emotions", true);
    console.info("migrate/emotions imported", { count: records.length });
    res.status(200).json({ ok: true, imported: records.length });
  } catch {
    res.status(500).json({ ok: false, reason: "storage_error" });
  }
}
