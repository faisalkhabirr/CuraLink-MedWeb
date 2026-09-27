import dotenv from 'dotenv';
// ESM imports are evaluated before the importing module's body, so the
// `dotenv.config()` call in server.js runs *after* this file is evaluated.
// Loading dotenv here guarantees process.env.LOG_LEVEL is read from .env
// (same pattern as ./rateLimit.js).
dotenv.config();

import pino from 'pino';

// The single pino instance the whole API logs through. Output is JSON so Vercel
// can index it; level comes from LOG_LEVEL (defaults to "info").
//
// Request-scoped loggers are created in server.js as
//     req.log = logger.child({ reqId: req.id })
// which is why every controller line carries the same reqId that the caller
// received back in the X-Request-Id header - one grep reconstructs a request.
//
// Redaction is defensive: nothing in this codebase logs bodies or headers
// today, but a future debug line must not be able to leak a credential.
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: [
      'password',
      '*.password',
      'token',
      '*.token',
      'req.headers.authorization',
      'req.headers.cookie',
    ],
    censor: '[redacted]',
  },
});

export default logger;
