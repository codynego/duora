import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Request, RequestHandler } from 'express';
import type { Socket } from 'socket.io';
import type { AppConfig } from '../config/env.js';

export interface Actor {
  id: string;
  roles: string[];
}

declare global {
  namespace Express {
    interface Request { actor?: Actor; }
  }
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function verifyToken(token: string, config: AppConfig): Actor | null {
  if (!config.jwtSecret) return null;
  const [encodedHeader, encodedPayload, signature, ...extra] = token.split('.');
  if (!encodedHeader || !encodedPayload || !signature || extra.length) return null;
  const expected = createHmac('sha256', config.jwtSecret).update(`${encodedHeader}.${encodedPayload}`).digest('base64url');
  const signatureBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expected);
  if (signatureBytes.length !== expectedBytes.length || !timingSafeEqual(signatureBytes, expectedBytes)) return null;

  try {
    const header = JSON.parse(base64UrlDecode(encodedHeader)) as { alg?: string };
    const claims = JSON.parse(base64UrlDecode(encodedPayload)) as { sub?: string; exp?: number; iss?: string; aud?: string | string[]; roles?: unknown };
    const audience = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    if (header.alg !== 'HS256' || !claims.sub || claims.iss !== config.issuer || !audience.includes(config.audience) || !claims.exp || claims.exp * 1000 <= Date.now()) return null;
    return { id: claims.sub, roles: Array.isArray(claims.roles) ? claims.roles.filter((role): role is string => typeof role === 'string') : [] };
  } catch { return null; }
}

function tokenFromRequest(request: Request) {
  const value = request.header('authorization');
  return value?.startsWith('Bearer ') ? value.slice(7) : undefined;
}

export function optionalActor(config: AppConfig): RequestHandler {
  return (request, _response, next) => {
    const token = tokenFromRequest(request);
    if (token) request.actor = verifyToken(token, config) ?? undefined;
    next();
  };
}

export function requireActor(): RequestHandler {
  return (request, response, next) => request.actor ? next() : response.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Sign in is required for this action.' } });
}

export function authenticateSocket(socket: Socket, config: AppConfig, next: (error?: Error) => void) {
  const supplied = socket.handshake.auth?.token;
  const token = typeof supplied === 'string' ? supplied : undefined;
  const actor = token ? verifyToken(token, config) : null;
  if (actor) { socket.data.actor = actor; return next(); }
  if (config.allowDevGuests) { socket.data.actor = { id: `dev_${socket.id}`, roles: [] } satisfies Actor; return next(); }
  next(new Error('UNAUTHENTICATED'));
}
