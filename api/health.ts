import type { VercelRequest, VercelResponse } from "@vercel/node";

import { applyCors } from "./_lib/cors.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res, { methods: "GET,OPTIONS" })) return;

  if (req.method !== "GET") {
    res.status(405).json({ ok: false, reason: "method_not_allowed" });
    return;
  }

  res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");

  res.status(200).json({
    ok: true,
    ts: new Date().toISOString(),
  });
}
