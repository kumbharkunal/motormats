import 'server-only';

import pino from 'pino';

import { serverEnv } from './env.server';

export const logger = pino({
  level: serverEnv.LOG_LEVEL ?? (serverEnv.NODE_ENV === 'production' ? 'info' : 'debug'),
  redact: {
    paths: [
      'password',
      'token',
      'idToken',
      'accessToken',
      'refreshToken',
      'sessionToken',
      'authorization',
      'cookie',
      'privateKey',
      'secret',
      '*.password',
      '*.token',
      '*.secret',
      'req.headers.authorization',
      'req.headers.cookie',
    ],
    censor: '[redacted]',
  },
  base: { service: 'motormats' },
});

export type RequestLogger = ReturnType<typeof logger.child>;

export function requestLogger(requestId: string): RequestLogger {
  return logger.child({ requestId });
}
