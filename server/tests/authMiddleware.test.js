// protect (server/middleware/authMiddleware.js), exercised through a real
// protected route: GET /api/auth/me.
//
// Three token states must be distinguishable by the server but never by the
// caller's ability to read internals: valid -> 200, expired -> 401, revoked
// (stale tokenVersion) -> 401.
import { describe, it, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

import { app, closeTestApp } from './helpers/testApp.js';
import { createUser, resetDatabase, bearer, tokenFor } from './helpers/fixtures.js';
import User from '../models/User.js';

after(async () => {
  await closeTestApp();
});

describe('auth middleware (GET /api/auth/me)', () => {
  let user;

  beforeEach(async () => {
    await resetDatabase();
    user = await createUser({ email: 'member@example.com' });
  });

  it('accepts a valid token and returns the current user', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set(bearer(tokenFor(user)));

    assert.equal(res.status, 200);
    assert.equal(res.body.email, 'member@example.com');
    // Whitelisted fields only - never the password hash or tokenVersion.
    assert.equal(res.body.password, undefined);
    assert.equal(res.body.tokenVersion, undefined);
  });

  it('rejects an expired token with 401', async () => {
    const expired = tokenFor(user, { expiresIn: '-1h' });

    const res = await request(app).get('/api/auth/me').set(bearer(expired));

    assert.equal(res.status, 401);
    assert.equal(res.body.message, 'Not authorized, token failed');
    // Nothing about the JWT internals (expiry, signature, payload) leaks.
    assert.deepEqual(Object.keys(res.body), ['message']);
    assert.doesNotMatch(JSON.stringify(res.body), /expired|jwt|signature|token version/i);
  });

  it('rejects a token carrying a stale tokenVersion with 401', async () => {
    // Token minted while the account was on version 0...
    const stale = tokenFor(user, { tokenVersion: 0 });
    // ...then the account moves on (password change / logout-everywhere).
    await User.updateOne({ _id: user._id }, { $inc: { tokenVersion: 1 } });

    const res = await request(app).get('/api/auth/me').set(bearer(stale));

    assert.equal(res.status, 401);
    assert.equal(res.body.message, 'Not authorized, session revoked');
    assert.deepEqual(Object.keys(res.body), ['message']);
  });

  it('still accepts a token whose tokenVersion matches the account', async () => {
    await User.updateOne({ _id: user._id }, { $inc: { tokenVersion: 1 } });
    const current = tokenFor(
      { ...user.toObject(), tokenVersion: user.tokenVersion + 1 }
    );

    const res = await request(app).get('/api/auth/me').set(bearer(current));

    assert.equal(res.status, 200);
    assert.equal(res.body.email, 'member@example.com');
  });

  it('rejects a request with no token at all', async () => {
    const res = await request(app).get('/api/auth/me');

    assert.equal(res.status, 401);
    assert.equal(res.body.message, 'Not authorized, no token');
  });
});
