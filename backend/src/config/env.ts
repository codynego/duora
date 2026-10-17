const LOCAL_ORIGINS = ['http://127.0.0.1:3000', 'http://localhost:3000'];

function readBoolean(name: string, fallback = false) {
  const value = process.env[name];
  return value === undefined ? fallback : value === 'true';
}

export function loadConfig() {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const origins = (process.env.CORS_ORIGINS ?? (nodeEnv === 'production' ? '' : LOCAL_ORIGINS.join(',')))
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (nodeEnv === 'production' && origins.length === 0) {
    throw new Error('CORS_ORIGINS must be configured in production. Wildcard origins are never allowed.');
  }

  const jwtSecret = process.env.DUORA_JWT_SECRET;
  if (nodeEnv === 'production' && (!jwtSecret || jwtSecret.length < 32)) {
    throw new Error('DUORA_JWT_SECRET must be at least 32 characters in production.');
  }

  return {
    nodeEnv,
    isProduction: nodeEnv === 'production',
    port: Number.parseInt(process.env.PORT ?? '4000', 10),
    corsOrigins: origins,
    jwtSecret,
    allowDevGuests: !readBoolean('DISABLE_DEV_GUESTS') && nodeEnv !== 'production',
    issuer: process.env.DUORA_JWT_ISSUER ?? 'duora',
    audience: process.env.DUORA_JWT_AUDIENCE ?? 'duora-app',
  } as const;
}

export type AppConfig = ReturnType<typeof loadConfig>;
