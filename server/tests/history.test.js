// Search history ownership (routes/search.js + getSearchHistory / exportHistory
// / deleteHistoryItem / clearHistory in controllers/searchController.js).
//
// Two users' rows exist side by side in every test. The assertions are about
// what the *other* user's data never does: never appears in a listing, never
// survives as deletable by someone else, never disappears when someone else
// wipes their own list.
import { describe, it, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

import { app, closeTestApp } from './helpers/testApp.js';
import {
  AI_ANSWER,
  bearer,
  createUser,
  resetDatabase,
  resetRateLimiters,
  tokenFor,
} from './helpers/fixtures.js';
import SearchHistory from '../models/SearchHistory.js';

let alice;
let bob;
let aliceToken;
let bobToken;
let aliceRow;
let bobRow;

after(async () => {
  await closeTestApp();
});

describe('search history ownership', () => {
  beforeEach(async () => {
    await resetDatabase();
    await resetRateLimiters();

    alice = await createUser({ name: 'Alice', email: 'alice@example.com' });
    bob = await createUser({ name: 'Bob', email: 'bob@example.com' });
    aliceToken = tokenFor(alice);
    bobToken = tokenFor(bob);

    aliceRow = await SearchHistory.create({
      userId: alice._id,
      query: 'alice private query',
      response: AI_ANSWER,
    });
    bobRow = await SearchHistory.create({
      userId: bob._id,
      query: 'bob private query',
      response: AI_ANSWER,
    });
  });

  it('GET /api/search/history lists only the caller\'s rows', async () => {
    const res = await request(app)
      .get('/api/search/history')
      .set(bearer(aliceToken));

    assert.equal(res.status, 200);
    assert.equal(res.body.length, 1, 'exactly the caller\'s own row');
    assert.equal(res.body[0].query, 'alice private query');
    assert.equal(
      res.body.some((row) => String(row._id) === String(bobRow._id)),
      false,
      'Bob\'s row must never be serialized to Alice'
    );
    // Scope is not echoed back either.
    assert.equal(res.body[0].userId, undefined);
  });

  it('GET /api/search/history/export exports only the caller\'s rows', async () => {
    const res = await request(app)
      .get('/api/search/history/export')
      .set(bearer(bobToken));

    assert.equal(res.status, 200);
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].query, 'bob private query');
    assert.equal(
      res.body.some((row) => String(row._id) === String(aliceRow._id)),
      false
    );
  });

  it('DELETE /api/search/history/:id refuses to delete another user\'s row', async () => {
    const res = await request(app)
      .delete(`/api/search/history/${bobRow._id}`)
      .set(bearer(aliceToken));

    // Ownership is part of the filter, so the document is simply not found -
    // 404, which also does not confirm that the id exists at all.
    assert.equal(res.status, 404);
    assert.deepEqual(Object.keys(res.body), ['message']);

    const stillThere = await SearchHistory.findById(bobRow._id);
    assert.ok(stillThere, 'Bob\'s row must survive Alice\'s delete');
  });

  it('DELETE /api/search/history/:id deletes the caller\'s own row', async () => {
    const res = await request(app)
      .delete(`/api/search/history/${aliceRow._id}`)
      .set(bearer(aliceToken));

    assert.equal(res.status, 200);
    assert.equal(await SearchHistory.findById(aliceRow._id), null);
    assert.ok(await SearchHistory.findById(bobRow._id), 'Bob\'s row is untouched');
  });

  it('DELETE /api/search/history clears only the caller\'s rows', async () => {
    const res = await request(app)
      .delete('/api/search/history')
      .set(bearer(aliceToken));

    assert.equal(res.status, 200);
    assert.equal(res.body.deletedCount, 1);
    assert.equal(await SearchHistory.countDocuments({ userId: alice._id }), 0);
    assert.ok(await SearchHistory.findById(bobRow._id), 'Bob\'s row must survive');
  });

  it('rejects every history route without a token', async () => {
    for (const [method, path] of [
      ['get', '/api/search/history'],
      ['get', '/api/search/history/export'],
      ['delete', `/api/search/history/${aliceRow._id}`],
      ['delete', '/api/search/history'],
    ]) {
      const res = await request(app)[method](path);
      assert.equal(res.status, 401, `${method.toUpperCase()} ${path}`);
    }

    // Nothing was touched on the way out.
    assert.equal(await SearchHistory.countDocuments({}), 2);
  });
});
