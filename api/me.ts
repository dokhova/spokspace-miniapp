import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

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

type InitDataVerification =
  | { ok: true; result: InitDataResult }
  | { ok: false; reason: string };

function getInitData(req: VercelRequest): string | null {
  const headerValue = req.headers["x-telegram-init-data"];
  if (typeof headerValue === "string" && headerValue.trim()) {
    return headerValue;
  }
  if (Array.isArray(headerValue) && headerValue[0]?.trim()) {
    return headerValue[0];
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

function timingSafeEqualHex(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length || a.length % 2 !== 0) return false;
  if (!/^[0-9a-f]+$/i.test(a) || !/^[0-9a-f]+$/i.test(b)) return false;
  const aBuf = Buffer.from(a, "hex");
  const bBuf = Buffer.from(b, "hex");
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function verifyInitData(initData: string, botToken: string): InitDataVerification {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return { ok: false, reason: "missing_hash" };

  const pairs: Record<string, string> = {};
  params.forEach((value, key) => {
    if (key !== "hash") {
      pairs[key] = value;
    }
  });

  const dataCheckString = Object.keys(pairs)
    .sort()
    .map((key) => `${key}=${pairs[key]}`)
    .join("\n");

  const secretKey = crypto.createHmac("sha256", botToken).update("WebAppData").digest();
  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (!timingSafeEqualHex(calculatedHash, hash)) {
    return { ok: false, reason: "hash_mismatch" };
  }

  const authDateRaw = pairs.auth_date;
  const authDate = authDateRaw ? Number.parseInt(authDateRaw, 10) : Number.NaN;
  if (!Number.isFinite(authDate)) return { ok: false, reason: "invalid_auth_date" };

  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > AUTH_MAX_AGE_SECONDS) {
    return { ok: false, reason: "auth_date_expired" };
  }

  const userRaw = pairs.user;
  if (!userRaw) return { ok: false, reason: "missing_user" };
  let user: TelegramUser;
  try {
    user = JSON.parse(userRaw) as TelegramUser;
  } catch {
    return { ok: false, reason: "invalid_user_json" };
  }
  if (!user?.id) return { ok: false, reason: "missing_user_id" };

  return { ok: true, result: { authDate, user } };
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    res.status(500).json({ ok: false, reason: "missing_TELEGRAM_BOT_TOKEN" });
    return;
  }

  const initData = getInitData(req);
  if (!initData) {
    res.status(401).json({ ok: false, reason: "missing_initData" });
    return;
  }

  const verified = verifyInitData(initData, botToken);
  if (!verified.ok) {
    res.status(401).json({ ok: false, reason: verified.reason });
    return;
  }

  const { user, authDate } = verified.result;
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
