import type { VercelRequest, VercelResponse } from "@vercel/node";
import { parse, validate } from "@telegram-apps/init-data-node";

import { applyCors } from "./_lib/cors";

const AUTH_MAX_AGE_SECONDS = 60 * 60 * 24;

type TelegramUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
};

function getInitData(req: VercelRequest): string | null {
  const headerValue = req.headers["x-telegram-init-data"];
  if (typeof headerValue === "string" && headerValue.trim()) {
    return headerValue;
  }
  if (Array.isArray(headerValue) && headerValue[0]?.trim()) {
    return headerValue[0];
  }

  const authHeader = req.headers.authorization;
  if (typeof authHeader === "string" && authHeader.trim()) {
    const token = authHeader.split(" ").pop();
    if (token?.trim()) return token;
  }

  const queryValue = req.query.initData;
  if (typeof queryValue === "string" && queryValue.trim()) {
    return queryValue;
  }
  if (Array.isArray(queryValue) && queryValue[0]?.trim()) {
    return queryValue[0];
  }

  return null;
}

function extractAuthDateSeconds(value: unknown): number | null {
  if (!value || typeof value !== "object") return null;
  const authDateValue = (value as { auth_date?: unknown }).auth_date;

  if (authDateValue instanceof Date) {
    return Math.floor(authDateValue.getTime() / 1000);
  }

  if (typeof authDateValue === "number" && Number.isFinite(authDateValue)) {
    return Math.floor(authDateValue);
  }

  if (typeof authDateValue === "string") {
    const numeric = Number(authDateValue);
    if (Number.isFinite(numeric)) {
      return Math.floor(numeric);
    }

    const parsedDate = new Date(authDateValue);
    if (!Number.isNaN(parsedDate.getTime())) {
      return Math.floor(parsedDate.getTime() / 1000);
    }
  }

  return null;
}

function extractUser(value: unknown): TelegramUser | null {
  if (!value || typeof value !== "object") return null;
  const user = (value as { user?: unknown }).user;
  if (!user || typeof user !== "object") return null;
  const id = (user as { id?: unknown }).id;
  if (typeof id !== "number") return null;
  return user as TelegramUser;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res, { methods: "GET,OPTIONS" })) return;

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    res.status(500).json({ ok: false, reason: "missing_TELEGRAM_BOT_TOKEN" });
    return;
  }

  const initData = getInitData(req);
  if (!initData) {
    res.status(401).json({ ok: false, reason: "missing_init_data" });
    return;
  }

  try {
    // Use the official Telegram init data validation to match spec and avoid HMAC drift.
    validate(initData, botToken, { expiresIn: AUTH_MAX_AGE_SECONDS });
  } catch {
    res.status(401).json({ ok: false, reason: "hash_mismatch" });
    return;
  }

  let parsed: unknown;
  try {
    parsed = parse(initData);
  } catch {
    res.status(401).json({ ok: false, reason: "hash_mismatch" });
    return;
  }

  const user = extractUser(parsed);
  if (!user) {
    res.status(401).json({ ok: false, reason: "missing_user" });
    return;
  }

  const authDate = extractAuthDateSeconds(parsed);
  if (authDate === null) {
    res.status(401).json({ ok: false, reason: "bad_init_data" });
    return;
  }

  const responseUser = {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    username: user.username,
    language_code: user.language_code,
  };

  res.status(200).json({
    ok: true,
    user: responseUser,
    auth_date: authDate,
    is_premium: user.is_premium,
  });
}
