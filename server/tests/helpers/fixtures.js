// Fixtures shared by every test file: users, JWTs, database cleanup, rate
// limiter reset and the mocked Groq transport.
//
// Nothing here touches a real external service - see mockGroqFetch and the
// networkGuard installed by ./testApp.js.
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import User from '../../models/User.js';
import SearchHistory from '../../models/SearchHistory.js';
import SearchCache from '../../models/SearchCache.js';
import { MEDICAL_DISCLAIMER } from '../../config/medicalPrompt.js';

// --- Users & tokens --------------------------------------------------------

// Cost 4 instead of the production 10: these hashes only ever have to be
// verified by bcrypt.compare in the login tests, and 4 rounds keeps the suite
// fast. login/register themselves still run their own hashing.
export async function createUser({
  name = 'Test User',
  email = 'test.user@example.com',
  password = 'password123',
} = {}) {
  return User.create({ name, email, password: await bcrypt.hash(password, 4) });
}

// Same payload shape and secret as authController's issueToken(), so a token
// minted here is indistinguishable from a real one to the middleware.
export function tokenFor(
  user,
  { tokenVersion = user.tokenVersion ?? 0, expiresIn = '7d' } = {}
) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
      tokenVersion,
    },
    process.env.JWT_SECRET,
    { expiresIn }
  );
}

export const bearer = (token) => ({ Authorization: `Bearer ${token}` });

// --- Search fixtures -------------------------------------------------------

// A payload that satisfies aiResponseSchema (medicalAnswerSchema) exactly, so
// the controller accepts it on the first attempt instead of retrying.
export const AI_ANSWER = {
  type: 'medication',
  name: 'Ibuprofen',
  overview: 'Ibuprofen is a non-steroidal anti-inflammatory drug (NSAID).',
  details: {
    uses: 'Pain, fever and inflammation.',
    how_it_works: 'Inhibits cyclooxygenase, reducing prostaglandin synthesis.',
    side_effects: 'Upset stomach, dizziness, increased bleeding risk.',
    warnings: 'Avoid with kidney disease, ulcers or in late pregnancy.',
  },
  primary_treatments: ['Ibuprofen'],
  doctor_to_consult: {
    specialist: 'General Practitioner',
    reason: 'To confirm the dose and check it is safe with your history.',
  },
  emergency_warning: 'Seek care for chest pain or difficulty breathing.',
  disclaimer: MEDICAL_DISCLAIMER,
};

// The exact JSON envelope groq-sdk would hand back, so the controller's
// extractContent() + JSON.parse + aiResponseSchema path runs unchanged.
const completionFor = (answer) => ({
  id: 'chatcmpl-test',
  object: 'chat.completion',
  created: Math.floor(Date.now() / 1000),
  model: 'openai/gpt-oss-120b',
  choices: [
    {
      index: 0,
      message: { role: 'assistant', content: JSON.stringify(answer) },
      finish_reason: 'stop',
    },
  ],
  usage: {
    queue_time: 0,
    prompt_tokens: 10,
    prompt_time: 0.01,
    completion_tokens: 20,
    completion_time: 0.01,
    total_tokens: 30,
    total_time: 0.02,
  },
});

// Replaces globalThis.fetch - which is what groq-sdk resolves when it builds
// its client (client.js: options.fetch ?? getDefaultFetch()), and the client
// is constructed per request - with a stub that answers a canned completion
// and records every call. Returns { calls, restore }.
//
// This is the single place an "outbound" request can originate: the stub never
// performs I/O, so no request can reach api.groq.com and no credits can be
// spent, whatever GROQ_API_KEY contains.
export function mockGroqFetch(answer = AI_ANSWER) {
  const original = globalThis.fetch;
  const calls = [];

  globalThis.fetch = async (input, init = {}) => {
    calls.push({ url: String(input), init });
    return new Response(JSON.stringify(completionFor(answer)), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  return {
    calls,
    restore() {
      globalThis.fetch = original;
    },
  };
}

// --- Test hygiene ----------------------------------------------------------

// Each test file runs in its own process with its own in-memory rate-limit
// store, so counters only accumulate within one file. Resetting before every
// test keeps a file from ever hitting authLimiter's 10 / searchLimiter's 20.
// Keys cover every address express can derive from a supertest connection.
const CLIENT_KEYS = ['127.0.0.1', '::ffff:127.0.0.1', '::1'];

export async function resetRateLimiters() {
  // Dynamic import so this can only run after testApp.js has pinned REDIS_URL
  // to '', regardless of how a future test file orders its own imports.
  const { authLimiter, searchLimiter } = await import('../../config/rateLimit.js');
  for (const limiter of [authLimiter, searchLimiter]) {
    for (const key of CLIENT_KEYS) limiter.resetKey(key);
  }
}

// SearchCache is keyed by query alone and shared across users, so stale rows
// would turn a "calls Groq" test into a "cache hit" test. Wipe everything.
export async function resetDatabase() {
  await Promise.all([
    User.deleteMany({}),
    SearchHistory.deleteMany({}),
    SearchCache.deleteMany({}),
  ]);
}
