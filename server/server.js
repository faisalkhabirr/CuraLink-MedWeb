import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import crypto from 'node:crypto';
import { z } from 'zod';

// pino instance - request-scoped children (req.log) are derived from it
import logger from './config/logger.js';

// Import Routes
import authRoutes from './routes/auth.js';
import searchRoutes from './routes/search.js';

// Rate limiters (Redis-backed when REDIS_URL is set, see ./config/rateLimit.js)
import { authLimiter, searchLimiter } from './config/rateLimit.js';

// --- Startup environment validation (zod) --------------------------------
// Runs before mongoose.connect() and before `export default app`, so a
// misconfigured deployment stops here with one fatal line instead of failing
// every request with 500s - or, worse, signing JWTs with an empty/short
// secret.
//
// This module only *builds* the Express app. It never calls app.listen():
// Vercel imports it through api/index.js as a serverless function, and the
// local listener lives in ./start.js.

// A required env var: present, non-empty, not whitespace-only.
const requiredEnv = (name) =>
  z.string().refine((value) => value.trim().length > 0, {
    message: `${name} is required and must not be empty`,
  });

const envSchema = z
  .object({
    MONGO_URI: requiredEnv('MONGO_URI'),
    JWT_SECRET: requiredEnv('JWT_SECRET'),
    GROQ_API_KEY: requiredEnv('GROQ_API_KEY'),
  })
  .superRefine((env, ctx) => {
    // Length rule fires only when the presence rule above passed, so a
    // missing/empty secret still produces exactly one message per key.
    const secret = env.JWT_SECRET.trim();
    if (secret.length === 0 || secret.length >= 32) return;
    ctx.addIssue({
      code: 'custom',
      path: ['JWT_SECRET'],
      message: `JWT_SECRET must be at least 32 characters (got ${secret.length})`,
    });
  });

// `?? ''` maps "unset" onto "" so an absent var reports the clear message
// above rather than Zod's generic "expected string, received undefined".
const envResult = envSchema.safeParse({
  MONGO_URI: process.env.MONGO_URI ?? '',
  JWT_SECRET: process.env.JWT_SECRET ?? '',
  GROQ_API_KEY: process.env.GROQ_API_KEY ?? '',
});

if (!envResult.success) {
  const issues = envResult.error.issues.map(
    (issue) => `${issue.path.join('.')}: ${issue.message}`
  );
  logger.fatal(
    { issues },
    'Environment validation failed - refusing to start (server/.env locally, project env vars on Vercel)'
  );
  process.exit(1);
}

const app = express();

// Trust exactly one proxy hop so req.ip - the rate limit key - is the real
// client IP. Vercel always sets X-Forwarded-For, and express-rate-limit throws
// ERR_ERL_UNEXPECTED_X_FORWARDED_FOR on every limited request while trust proxy
// is false. Must stay a number: `true` is rejected as too permissive.
app.set('trust proxy', 1);

// Request-ID middleware (mounted before every other middleware/route)
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  // Child logger bound to that id: every line logged while handling this
  // request carries reqId, so server logs can be joined to the X-Request-Id
  // the caller received (see ./config/logger.js).
  req.log = logger.child({ reqId: req.id });
  res.setHeader('X-Request-Id', req.id);
  next();
});

// Middleware
app.use(helmet());
// app.use(
//   cors({
//     origin: process.env.CLIENT_URL,
//     credentials: true,
//   })
// );

app.use(
  cors({
    origin: [
      'https://cura-link-med-web.vercel.app',
      /https:\/\/cura-link-med-web.*\.vercel\.app$/
    ],
    credentials: true,
  })
);

// Express json middleware
app.use(express.json());

// Rate limiters - MUST be mounted before the routers they protect, otherwise
// Express stops at the router and the limiters never run.
app.use(['/api/auth/login', '/api/auth/register', '/api/auth/change-password'], authLimiter);
app.use('/api/search', searchLimiter);

// GET /health - readiness probe. 200 only while Mongo is actually connected
// (readyState 1 === mongoose.ConnectionStates.connected); a cold start, a
// failed connect or a dropped connection answers 503 so a load balancer or
// uptime check can stop routing to this instance.
app.get('/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json(
    connected
      ? { status: 'ok' }
      : { status: 'unavailable', readyState: mongoose.connection.readyState }
  );
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);

// --- 404 for unmatched /api routes ---------------------------------------
// Registered after every router, so any /api path no route claimed is
// answered here with JSON instead of Express's default HTML
// "Cannot GET /api/...". Deliberately `'/api'` and not `'/api/*'`: Express 5
// uses path-to-regexp v8, which rejects a bare '*'.
// Non-/api paths fall through to Express's default handler.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found', requestId: req.id });
});

// --- Central error handler (MUST be last in the chain) -------------------
// Express only invokes 4-argument middleware when next(err) is called, a
// handler throws, or (Express 5) an async handler's promise rejects. Every
// unhandled error ends up here.
//
// Two rules: log everything, send nothing. The raw message and stack go to
// pino only; the client always gets the same generic body, so an internal
// detail (a Mongo error, a provider key, a file path) can never leak.
app.use((err, req, res, next) => {
  // req.id / req.log are set by the request-id middleware mounted first;
  // generate a fresh id if the failure happened before that ran.
  const requestId = req.id ?? crypto.randomUUID();
  const log = req.log ?? logger.child({ reqId: requestId });

  // pino's error level; `err` is the reserved key pino serialises into
  // { type, message, stack }.
  log.error({ err, reqId: requestId }, 'Unhandled error');

  // Response already started - the body can no longer be rewritten, so hand
  // it back to Express's default handler rather than corrupting the reply.
  if (res.headersSent) return next(err);

  // A 4xx (e.g. a malformed JSON body rejected by express.json()) is the
  // caller's error: keep its status, but still never its raw message.
  const status = err?.status ?? err?.statusCode;
  const code = Number.isInteger(status) && status >= 400 && status < 600 ? status : 500;

  res.status(code).json({ error: 'Something went wrong', requestId });
});

// MongoDB Connection
// Kept here rather than in ./start.js: the Vercel entry point (api/index.js)
// imports this module directly and nothing else, so the import itself has to
// open the connection.
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => logger.info('MongoDB connected successfully'))
  .catch((error) => logger.error({ err: error }, 'Error connecting to MongoDB'));

// The app is this module's only export. No app.listen() here - the local
// listener is ./start.js, and on Vercel api/index.js exports the app itself.
export default app;
