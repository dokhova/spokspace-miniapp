export type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

type CacheFetchOptions = RequestInit & { revalidate?: boolean };

function hasStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getCache<T>(key: string): CacheEntry<T> | null {
  if (!hasStorage()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry<T>;
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.expiresAt !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setCache<T>(key: string, value: T, ttlMs: number): CacheEntry<T> {
  const entry: CacheEntry<T> = { value, expiresAt: Date.now() + ttlMs };
  if (!hasStorage()) return entry;
  try {
    window.localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Ignore storage quota and serialization errors.
  }
  return entry;
}

export function isFresh(entry: CacheEntry<unknown>): boolean {
  return entry.expiresAt > Date.now();
}

export function listCacheKeys(prefix: string): string[] {
  if (!hasStorage()) return [];
  try {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key);
      }
    }
    return keys;
  } catch {
    return [];
  }
}

export async function fetchJsonWithCache<T>(
  url: string,
  cacheKey: string,
  ttlMs: number,
  options?: CacheFetchOptions,
): Promise<T> {
  const cached = getCache<T>(cacheKey);
  const { revalidate = true, ...fetchOptions } = options ?? {};

  if (cached && isFresh(cached)) {
    if (revalidate) {
      void fetch(url, fetchOptions)
        .then((response) => {
          if (!response.ok) throw new Error("Request failed");
          return response.json() as Promise<T>;
        })
        .then((payload) => {
          setCache(cacheKey, payload, ttlMs);
        })
        .catch(() => {
          // Ignore background refresh errors.
        });
    }
    return cached.value;
  }

  try {
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      throw new Error("Request failed");
    }
    const payload = (await response.json()) as T;
    setCache(cacheKey, payload, ttlMs);
    return payload;
  } catch (error) {
    if (cached) return cached.value;
    throw error;
  }
}
