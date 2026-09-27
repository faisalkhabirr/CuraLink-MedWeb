// Register + login, against the real app: /api/auth/register and
// /api/auth/login, including the validate() middleware in front of them.
//
// The recurring theme of the second half of this file is account-existence
// disclosure: no response may tell a caller whether an email is registered.
import { describe, it, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// MUST be the first import: it pins the environment, starts the in-memory
// MongoDB and only then loads server.js (static imports are hoisted, so the
// app is deliberately loaded dynamically inside this module).
import { app, closeTestApp } from './helpers/testApp.js';
import {
  createUser,
  resetDatabase,
  resetRateLimiters,
} from './helpers/fixtures.js';
import User from '../models/User.js';

const GENERIC_REGISTER_MESSAGE = 'Registration could not be completed';

after(async () => {
  await closeTestApp();
});

describe('POST /api/auth/register', () => {
  beforeEach(async () => {
    await resetDatabase();
    await resetRateLimiters();
  });

  it('creates the account and returns a token on success', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'password123',
    });

    assert.equal(res.status, 201);
    assert.equal(typeof res.body.token, 'string');

    // Only a token leaves the API - never the hash, never anything else.
    assert.deepEqual(Object.keys(res.body), ['token']);

    const user = await User.findOne({ email: 'ada@example.com' }).select('+password');
    assert.ok(user, 'the account should be persisted');
    assert.notEqual(user.password, 'password123', 'the password must be stored hashed');
    assert.ok(user.password.startsWith('$2'), 'the password should be a bcrypt hash');

    // The issued token really belongs to that account.
    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
    assert.equal(decoded.id, String(user._id));
    assert.equal(decoded.email, 'ada@example.com');
  });

  it('rejects a duplicate email with a generic message that gives nothing away', async () => {
    await createUser({ email: 'taken@example.com' });

    const res = await request(app).post('/api/auth/register').send({
      name: 'Someone Else',
      email: 'taken@example.com',
      password: 'password123',
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.message, GENERIC_REGISTER_MESSAGE);
    // The point of the generic message: no wording that confirms an account.
    assert.doesNotMatch(
      String(res.body.message),
      /exist|already|taken|registered|in use|sign in|log in/i
    );
    assert.equal(res.body.token, undefined);

    // Rejected without creating a second row.
    assert.equal(await User.countDocuments({ email: 'taken@example.com' }), 1);
  });

  it('rejects a missing field with 400 and no token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'No Password',
      email: 'nopw@example.com',
      // password missing
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.token, undefined);
    assert.equal(await User.countDocuments({}), 0, 'nothing should be persisted');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await resetDatabase();
    await resetRateLimiters();
    await createUser({ email: 'known@example.com', password: 'correct-horse' });
  });

  it('returns a token for correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'known@example.com', password: 'correct-horse' });

    assert.equal(res.status, 200);
    assert.equal(typeof res.body.token, 'string');
    assert.deepEqual(Object.keys(res.body), ['token']);

    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
    assert.equal(decoded.email, 'known@example.com');
  });

  it('rejects a wrong password with a generic 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'known@example.com', password: 'wrong-password' });

    assert.equal(res.status, 401);
    assert.equal(res.body.message, 'Invalid credentials');
    assert.equal(res.body.token, undefined);
  });

  it('rejects an unknown email with a response identical to the wrong-password case', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'correct-horse' });

    assert.equal(res.status, 401);
    assert.equal(res.body.message, 'Invalid credentials');
    assert.equal(res.body.token, undefined);
  });

  it('cannot be used to tell whether an email is registered', async () => {
    // Same password, two emails: one that exists, one that does not. If the
    // responses differ in status, body or headers (other than the request id),
    // the endpoint is an account-existence oracle.
    const existing = await request(app)
      .post('/api/auth/login')
      .send({ email: 'known@example.com', password: 'definitely-wrong' });
    const missing = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost@example.com', password: 'definitely-wrong' });

    assert.equal(existing.status, missing.status);
    assert.deepEqual(existing.body, missing.body);

    // Neither answer may contain the probed email, the password or any hint
    // about which of the two branches ran.
    for (const res of [existing, missing]) {
      assert.deepEqual(Object.keys(res.body), ['message']);
      assert.doesNotMatch(JSON.stringify(res.body), /known@example|ghost@example|password/i);
      assert.equal(res.headers['x-request-id'] !== undefined, true);
    }
  });
});
