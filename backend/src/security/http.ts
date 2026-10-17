import type { NextFunction, Request, Response } from 'express';
import type { AppConfig } from '../config/env.js';

export function securityHeaders(_request: Request, response: Response, next: NextFunction) {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
}

export function corsOptions(config: AppConfig) {
  return {
    origin(origin: string | undefined, callback: (error: Error | null, allowed?: boolean) => void) {
      if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Origin is not allowed by CORS policy.'));
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    maxAge: 600,
  };
}

export function createRateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return (request: Request, response: Response, next: NextFunction) => {
    const key = request.ip ?? 'unknown';
    const now = Date.now();
    const hit = hits.get(key);
    const current = !hit || hit.resetAt <= now ? { count: 0, resetAt: now + windowMs } : hit;
    current.count += 1;
    hits.set(key, current);
    response.setHeader('RateLimit-Remaining', String(Math.max(0, limit - current.count)));
    if (current.count > limit) return response.status(429).json({ error: { code: 'RATE_LIMITED', message: 'Try again shortly.' } });
    next();
  };
}
