// Rate limiter configuration.
//
// Exports two limiters:
//   - authLimiter   -> strict, for POST /api/auth/login and /api/auth/register
//   - searchLimiter -> looser, for /api/search (it proxies a paid external API)
//
// Both are Redis-backed when REDIS_URL is configured, so counters are shared
// across serverless (Vercel) invocations. Without REDIS_URL they fall back to
// express-rate-limit's in-memory store, which is per-instance only.

import dotenv from 'dotenv';
// ESM imports are evaluated before the importing module's body, so the
// `dotenv.config()` call in server.js runs *after* this file is evaluated.
// Loading dotenv here guarantees process.env.REDIS_URL is read from .env.
dotenv.config();

import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { createClient } from 'redis';
// Shared pino instance. Neither log below is inside a request, so neither
// carries a reqId - that is expected for these two (see ./logger.js).
import logger from './logger.js';

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const REDIS_URL = process.env.REDIS_URL;

let redisClient = null;

if (REDIS_URL) {
  // Connection string comes from the environment only - never hardcoded.
  redisClient = createClient({ url: REDIS_URL });

  // An 'error' listener is mandatory: without one, a failed connection attempt
  // becomes an uncaught exception and kills the serverless function. Logged
  // once so a flapping Redis does not flood the logs.
  let reportedError = false;
  const reportError = (error) => {
    if (reportedError) return;
    reportedError = true;
    logger.error({ err: error }, '[rate-limit] Redis error, rate limiting continues');
  };
  redisClient.on('error', reportError);
  redisClient.connect().catch(reportError);
} else {
  // Module scope => emitted once per process / cold start, never per request.
  logger.warn(
    '[rate-limit] REDIS_URL is not set - using the default in-memory store. ' +
      'Rate limiting is NOT distributed: every serverless instance keeps its own counters.'
  );
}

// node-redis queues commands issued while Redis is unreachable, so bound them:
// a Redis outage must not hang login/search requests. On timeout the store
// rejects and `passOnStoreError` lets the request through, uncounted.
const COMMAND_TIMEOUT_MS = 3000;

function sendCommand(...args) {
  return Promise.race([
    redisClient.sendCommand(args),
    new Promise((_resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error(`rate-limit: Redis command timed out after ${COMMAND_TIMEOUT_MS}ms`)),
        COMMAND_TIMEOUT_MS
      );
      timer.unref?.();
    }),
  ]);
}

// express-rate-limit throws ERR_ERL_STORE_REUSE when a single store instance is
// shared across limiters, so each limiter gets its own store. When Redis is not
// configured this returns undefined and express-rate-limit creates a fresh
// in-memory MemoryStore for that limiter.
function createRedisStore(prefix) {
  if (!redisClient) return undefined;
  return new RedisStore({
    prefix,
    sendCommand,
  });
}

const sharedOptions = {
  windowMs: WINDOW_MS,
  // IETF draft-6 RateLimit-* response headers (replaces the deprecated X-RateLimit-* style).
  standardHeaders: 'draft-6',
  // If Redis becomes unreachable, fail open (allow the request, let
  // express-rate-limit log the store error) rather than 500-ing login/search.
  passOnStoreError: true,
};

// Strict limiter: credential endpoints are a brute-force target.
export const authLimiter = rateLimit({
  ...sharedOptions,
  limit: 10,
  message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
  store: createRedisStore('curalink:ratelimit:auth:'),
});

// Separate bucket: every hit here costs a paid external API call.
export const searchLimiter = rateLimit({
  ...sharedOptions,
  limit: 20,
  message: 'Too many search requests from this IP, please try again after 15 minutes',
  store: createRedisStore('curalink:ratelimit:search:'),
});
