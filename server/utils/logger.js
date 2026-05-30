// server/utils/logger.js
// Centralized structured logger with automatic credential redaction.
// Uses pino for performance (JSON in production, pretty-print in dev).
import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

const logger = pino({
  level: isProduction ? 'info' : 'debug',

  // Automatically redact sensitive fields if they ever appear in log arguments.
  // This is a safety net — callers should never pass secrets intentionally.
  redact: {
    paths: [
      'password',
      'token',
      'authorization',
      'apiKey',
      'api_key',
      'apiSecret',
      'api_secret',
      'secret',
      'jwt',
      'cookie',
      'req.headers.authorization',
      'req.body.password',
      'req.body.token',
    ],
    censor: '[REDACTED]',
  },

  // Pretty-print for development, structured JSON for production
  transport: isProduction
    ? undefined
    : { target: 'pino-pretty', options: { colorize: true } },
});

export default logger;
