const DEBOUNCE_MS = 60_000;

export function trackEvent(eventName: string, data: Record<string, unknown> = {}): void {
  try {
    const client = (window as { Telegram?: { WebApp?: unknown } }).Telegram?.WebApp
      ? "telegram"
      : "web";
    const practiceId =
      typeof data.practiceId === "string" && data.practiceId.trim() ? data.practiceId.trim() : null;
    const baseKey = `track:${client}:${eventName}`;
    const debounceKey = practiceId ? `${baseKey}:${practiceId}` : baseKey;
    try {
      const storage = window.localStorage;
      const lastSentRaw = storage.getItem(debounceKey);
      const lastSent = lastSentRaw ? Number(lastSentRaw) : 0;
      if (Number.isFinite(lastSent) && Date.now() - lastSent < DEBOUNCE_MS) {
        return;
      }
      storage.setItem(debounceKey, String(Date.now()));
    } catch {
      // Fail open if storage is unavailable.
    }
    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: eventName, ts: Date.now(), client, ...data }),
    }).catch(() => {
      // Ignore network errors to keep UI responsive.
    });
  } catch {
    // Ignore unexpected errors to keep UI responsive.
  }
}
