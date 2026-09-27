// POST /api/search (routes/search.js + controllers/searchController.js).
//
// The Groq transport is fully mocked (fixtures.mockGroqFetch), so these tests
// can never reach api.groq.com or spend credits - see the networkGuard in
// helpers/testApp.js, which makes any unmocked fetch throw.
import { describe, it, beforeEach, afterEach, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

import { app, closeTestApp } from './helpers/testApp.js';
import {
  AI_ANSWER,
  bearer,
  createUser,
  mockGroqFetch,
  resetDatabase,
  resetRateLimiters,
  tokenFor,
} from './helpers/fixtures.js';
import { EMERGENCY_RESPONSE } from '../config/medicalPrompt.js';
import SearchHistory from '../models/SearchHistory.js';

let groq;

afterEach(() => {
  // Restores the network guard that testApp.js installed.
  groq?.restore();
  groq = undefined;
});

after(async () => {
  await closeTestApp();
});

describe('POST /api/search', () => {
  beforeEach(async () => {
    await resetDatabase();
    await resetRateLimiters();
    groq = mockGroqFetch();
  });

  it('answers an authenticated request with the model response', async () => {
    const user = await createUser({ email: 'searcher@example.com' });

    const res = await request(app)
      .post('/api/search')
      .set(bearer(tokenFor(user)))
      .send({ query: 'What is ibuprofen used for?' });

    assert.equal(res.status, 200);
    assert.equal(res.body.source, 'ai');
    assert.deepEqual(res.body.data, AI_ANSWER);

    // Exactly one upstream call, and it went to the stub - the stub *is*
    // globalThis.fetch, so nothing could have left the process.
    assert.equal(groq.calls.length, 1);
    assert.match(groq.calls[0].url, /^https:\/\/api\.groq\.com\//);

    // The search is recorded against the caller's own history only.
    const rows = await SearchHistory.find({ userId: user._id });
    assert.equal(rows.length, 1);
    assert.equal(rows[0].query, 'what is ibuprofen used for?');
  });

  it('rejects an unauthenticated request without calling out to Groq', async () => {
    const res = await request(app)
      .post('/api/search')
      .send({ query: 'What is ibuprofen used for?' });

    assert.equal(res.status, 401);
    assert.equal(res.body.message, 'Not authorized, no token');
    // Rejected before any paid upstream call could be made.
    assert.equal(groq.calls.length, 0);
    assert.equal(await SearchHistory.countDocuments({}), 0);
  });

  it('returns the static emergency response without calling out to Groq', async () => {
    const user = await createUser({ email: 'emergency@example.com' });

    const res = await request(app)
      .post('/api/search')
      .set(bearer(tokenFor(user)))
      .send({ query: 'I suddenly have severe chest pain' });

    assert.equal(res.status, 200);
    assert.equal(res.body.source, 'emergency');
    assert.deepEqual(res.body.data, EMERGENCY_RESPONSE);
    // The emergency gate runs before the cache and before the API call.
    assert.equal(groq.calls.length, 0);

    // It still lands in the user's history so the entry is visible later.
    const rows = await SearchHistory.find({ userId: user._id });
    assert.equal(rows.length, 1);
    assert.equal(rows[0].query, 'i suddenly have severe chest pain');
  });

  it('does not spend an API call on a query that is already cached', async () => {
    const user = await createUser({ email: 'cache@example.com' });
    // First request pays the (mocked) upstream call and fills the cache.
    await request(app)
      .post('/api/search')
      .set(bearer(tokenFor(user)))
      .send({ query: 'What is paracetamol?' });
    assert.equal(groq.calls.length, 1);

    const second = await request(app)
      .post('/api/search')
      .set(bearer(tokenFor(user)))
      .send({ query: 'What is paracetamol?' });

    assert.equal(second.status, 200);
    assert.equal(second.body.source, 'cache');
    assert.deepEqual(second.body.data, AI_ANSWER);
    assert.equal(groq.calls.length, 1, 'the cache hit must not call Groq again');
  });
});
