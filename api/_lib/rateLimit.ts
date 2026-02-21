import type { VercelRequest } from "@vercel/node";
import { kv } from "@vercel/kv";

type RateLimitOptions = {
  windowMs: number;
  limit: number;
};

type RateLimitResult = {
  allowed: boolean;
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

function getUserIdFromInitData(initData: string): string | null {
  try {
    const params = new URLSearchParams(initData);
    const userValue = params.get("user");
    if (!userValue) return null;
    const parsed = JSON.parse(userValue) as { id?: unknown };
    if (typeof parsed.id === "number" && Number.isFinite(parsed.id)) {
      return String(parsed.id);
    }
  } catch {
    return null;
  }
  return null;
}

function getUserIdFromRequest(req: VercelRequest): string | null {
  const initData = getInitData(req);
  if (initData) {
    const initUserId = getUserIdFromInitData(initData);
    if (initUserId) return initUserId;
  }

  const queryUserId = req.query.user_id;
  if (typeof queryUserId === "string" && queryUserId.trim()) return queryUserId.trim();
  if (Array.isArray(queryUserId) && queryUserId[0]?.trim()) return queryUserId[0].trim();

  const body = req.body;
  if (body && typeof body === "object" && "user_id" in body) {
    const rawId = (body as { user_id?: unknown }).user_id;
    if (typeof rawId === "string" && rawId.trim()) return rawId.trim();
  }
  if (typeof body === "string") {
    try {
      const parsed = JSON.parse(body) as { user_id?: unknown };
      if (typeof parsed.user_id === "string" && parsed.user_id.trim()) {
        return parsed.user_id.trim();
      }
    } catch {
      return null;
    }
  }

  return null;
}

function getForwardedFor(req: VercelRequest): string {
  const headerValue = req.headers["x-forwarded-for"];
  const forwarded = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}

export async function rateLimit(
  req: Request,
  routeName: string,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const nodeReq = req as unknown as VercelRequest;
  const userId = getUserIdFromRequest(nodeReq);
  const key = userId
    ? `rl:${routeName}:${userId}`
    : `rl:${routeName}:ip:${getForwardedFor(nodeReq)}`;

  const count = await kv.incr(key);
  if (count === 1) {
    const windowSeconds = Math.ceil(options.windowMs / 1000);
    await kv.expire(key, windowSeconds);
  }

  return { allowed: count <= options.limit };
}
