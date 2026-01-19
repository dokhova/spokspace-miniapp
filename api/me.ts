import type { VercelRequest, VercelResponse } from "@vercel/node";
import { parse, validate } from "@telegram-apps/init-data-node";

const AUTH_MAX_AGE_SECONDS = 60 * 60 * 24;

type TelegramUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
};

type InitDataResult = {
  authDate: number;
  user: TelegramUser;
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

export default function handler(req: VercelRequest, res: VercelResponse) {
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

  let parsed: ReturnType<typeof parse>;
  try {
    parsed = parse(initData);
  } catch {
    res.status(401).json({ ok: false, reason: "hash_mismatch" });
    return;
  }

  const user = parsed.user as TelegramUser | undefined;
  if (!user?.id) {
    res.status(401).json({ ok: false, reason: "missing_user" });
    return;
  }

  const authDate = Math.floor(parsed.auth_date.getTime() / 1000);
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
