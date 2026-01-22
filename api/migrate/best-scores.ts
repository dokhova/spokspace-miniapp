import type { VercelRequest, VercelResponse } from "@vercel/node";
import { kv } from "@vercel/kv";
import { z } from "zod";

import { applyCors } from "../_lib/cors.js";

const UserIdSchema = z.string().regex(/^tg_.+$/, "user_id must start with tg_");
const ScoreSchema = z.number().min(0, "best_score must be >= 0");

const MigrationBestScoreSchema = z.object({
  user_id: UserIdSchema,
  best_score: ScoreSchema,
});

const MigrationPayloadSchema = z.array(MigrationBestScoreSchema);

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

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
  }
  return 0;
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
    const alreadyMigrated = await kv.get<boolean>("migrated:best_scores");
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
      const currentRaw = await kv.get(`best:${item.user_id}`);
      const nextValue = Math.max(toNumber(currentRaw), item.best_score);
      await kv.set(`best:${item.user_id}`, nextValue);
    }

    await kv.set("migrated:best_scores", true);
    console.info("migrate/best-scores imported", { count: records.length });
    res.status(200).json({ ok: true, imported: records.length });
  } catch {
    res.status(500).json({ ok: false, reason: "storage_error" });
  }
}
