import type { VercelRequest, VercelResponse } from "@vercel/node";

const DEFAULT_ALLOWED_HEADERS = "Content-Type, X-Requested-With";

type CorsOptions = {
  methods: string;
  origin?: string;
  headers?: string;
};

export function applyCors(
  req: VercelRequest,
  res: VercelResponse,
  { methods, origin = "*", headers = DEFAULT_ALLOWED_HEADERS }: CorsOptions,
): boolean {
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", headers);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }

  return false;
}
