import type { Lang } from "./strings";

export type Localized = string | { en: string; ru: string };

export function pick(
  val: Localized | undefined,
  lang: Lang,
  fallback = ""
): string {
  if (!val) return fallback;
  if (typeof val === "string") return val;
  return val[lang] ?? fallback;
}
