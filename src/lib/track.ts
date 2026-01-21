export function trackEvent(eventName: string, data: Record<string, unknown> = {}): void {
  try {
    const client = (window as { Telegram?: { WebApp?: unknown } }).Telegram?.WebApp
      ? "telegram"
      : "web";
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
