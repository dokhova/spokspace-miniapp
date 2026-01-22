import type { VercelRequest, VercelResponse } from "@vercel/node";
import { kv } from "@vercel/kv";
import { z } from "zod";

import { applyCors } from "./_lib/cors.js";

const UserIdSchema = z.string().regex(/^tg_.+$/, "user_id must start with tg_");
const ScoreSchema = z.number().min(0, "score must be >= 0");

const BestScoreQuerySchema = z.object({
  user_id: UserIdSchema,
});

const BestScorePayloadSchema = z.object({
  user_id: UserIdSchema,
  score: ScoreSchema,
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

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
  }
  return 0;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res, { methods: "GET,POST,OPTIONS" })) return;

  if (req.method === "GET") {
    res.setHeader("Cache-Control", "no-store");

    const query = BestScoreQuerySchema.safeParse({
      user_id: getQueryParam(req.query.user_id),
    });

    if (!query.success) {
      res.status(400).json({ ok: false, reason: "invalid_query", issues: query.error.issues });
      return;
    }

    const { user_id } = query.data;

    try {
      const currentRaw = await kv.get(`best:${user_id}`);
      const best_score = toNumber(currentRaw);
      res.status(200).json({ user_id, best_score });
    } catch {
      res.status(500).json({ ok: false, reason: "storage_error" });
    }
    return;
  }

  if (req.method === "POST") {
    const payload = BestScorePayloadSchema.safeParse(extractJsonBody(req));
    if (!payload.success) {
      res.status(400).json({ ok: false, reason: "invalid_payload", issues: payload.error.issues });
      return;
    }

    const { user_id, score } = payload.data;

    try {
      const currentRaw = await kv.get(`best:${user_id}`);
      const best_score = Math.max(toNumber(currentRaw), score);
      await kv.set(`best:${user_id}`, best_score);
      res.status(200).json({ ok: true, user_id, best_score });
    } catch {
      res.status(500).json({ ok: false, reason: "storage_error" });
    }
    return;
  }

  res.status(405).json({ ok: false, reason: "method_not_allowed" });
}
