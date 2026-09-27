// Integration-test bootstrap: one in-memory MongoDB + the *real* Express app.
//
// Every test file starts by importing this module:
//
//     import { app, closeTestApp } from './helpers/testApp.js';
//
// Order is load-bearing, which is why the app is loaded with a dynamic import
// at the bottom of this file instead of a static one:
//
//   * server/server.js validates MONGO_URI / JWT_SECRET / GROQ_API_KEY when it
//     is evaluated and process.exit(1)s if any of them is missing, then calls
//     mongoose.connect(process.env.MONGO_URI) - so the in-memory URI has to
//     exist *before* that module is evaluated.
//   * Static imports are hoisted and evaluated before a module's body runs, so
//     a static `import app from '../../server.js'` here would fire before the
//     assignments below. The dynamic import runs after them, guaranteeing the
//     app sees the test environment.
//
// Every variable is set explicitly because dotenv.config() also runs inside
// the app's modules (config/logger.js, config/rateLimit.js) and dotenv never
// overwrites a variable that already exists - so these test values win over
// server/.env.
process.env.NODE_ENV = 'test';
// Keep test output as TAP, not a wall of JSON logs. Run
// `LOG_LEVEL=debug npm test` to see the request logs when debugging.
process.env.LOG_LEVEL ??= 'silent';
process.env.JWT_SECRET = 'integration-test-secret-32-characters-minimum!!';
// Never a real key: the Groq transport is replaced in tests/helpers/fixtures.js
// and networkGuard below fails loudly on any outbound call.
process.env.GROQ_API_KEY = 'test-only-groq-key-must-never-be-used';
// '' (empty, not unset) => config/rateLimit.js takes its in-memory branch, so
// the suite never opens a connection to a real Redis.
process.env.REDIS_URL = '';

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Started before the app import: MONGO_URI must already be a usable URI when
// server.js runs mongoose.connect().
const mongod = await MongoMemoryServer.create();

// Safety net for the whole suite: no test may reach the network. Anything that
// calls globalThis.fetch without installing its own stub (see mockGroqFetch)
// fails here with a clear message instead of spending real API credits.
// Installed after mongod startup on purpose - mongodb-memory-server is allowed
// to download its binary before we seal the door.
const realFetch = globalThis.fetch;
const networkGuard = {
  calls: [],
  install() {
    networkGuard.calls = [];
    globalThis.fetch = (...args) => {
      networkGuard.calls.push(String(args[0]));
      throw new Error(`Unexpected network call in tests: ${String(args[0])}`);
    };
  },
  restore() {
    globalThis.fetch = realFetch;
  },
};
networkGuard.install();
process.env.MONGO_URI = mongod.getUri();

const { default: app } = await import('../../server.js');

// server.js fires mongoose.connect() without awaiting it. Wait for the shared
// connection so the first test never races socket setup.
await mongoose.connection.asPromise();

// Stops the HTTP-independent halves: the mongoose connection, then mongod.
// Supertest opens its own ephemeral listener per request, so there is no
// server to close here.
export async function closeTestApp() {
  await mongoose.disconnect();
  await mongod.stop();
}

export { app, mongod, networkGuard };
