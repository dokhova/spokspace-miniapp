import { API_BASE_URL } from "../config/api";

export type TelegramMeResponse = {
  ok: boolean;
  user?: {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    language_code?: string;
  };
  auth_date?: number;
  is_premium?: boolean;
  reason?: string;
};

export function getTelegramInitData(): string | null {
  if (typeof window === "undefined") return null;
  return window.Telegram?.WebApp?.initData ?? null;
}

export async function fetchTelegramMe(): Promise<TelegramMeResponse | null> {
  const initData = getTelegramInitData() ?? "";

  try {
    const response = await fetch(`${API_BASE_URL}/api/me`, {
      headers: {
        "x-telegram-init-data": initData,
      },
    });
    const payload = (await response.json()) as TelegramMeResponse;
    if (!response.ok || !payload.ok) return null;
    return payload;
  } catch {
    return null;
  }
}
