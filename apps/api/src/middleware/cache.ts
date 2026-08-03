import { Request, Response, NextFunction } from "express";

interface CacheEntry {
  data: any;
  expires: number;
}

const cache = new Map<string, CacheEntry>();
const DEFAULT_TTL = 120 * 1000;

export function apiCache(durationSec: number = 120) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET") {
      return next();
    }

    const key = `cache:${req.originalUrl}`;
    const cached = cache.get(key);

    if (cached && Date.now() < cached.expires) {
      return res.json(cached.data);
    }

    if (cached) cache.delete(key);

    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      cache.set(key, { data: body, expires: Date.now() + durationSec * 1000 });
      return originalJson(body);
    };

    next();
  };
}

export function clearCache(pattern: string): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    const keys = Array.from(cache.keys());
    for (const key of keys) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
    next();
  };
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (entry.expires <= now) {
      cache.delete(key);
    }
  }
}, 60_000);
