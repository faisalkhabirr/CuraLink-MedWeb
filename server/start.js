// Local-only entry point.
//
// server/server.js builds and exports the Express app without ever calling
// app.listen(), because on Vercel it is imported as a serverless function by
// api/index.js and listening would be wrong there. This file is the other
// half: it imports that app and is the only place in the codebase that binds
// a port. Run it with `npm start` (or `npm run dev`) from server/.
//
// Never import this module from api/ - a serverless function must not listen.
import app from './server.js';
import logger from './config/logger.js';

// ./server.js and ./config/logger.js both call dotenv.config() while the
// module graph is evaluated, which happens before the body below - so
// process.env.PORT is already populated from server/.env at this point.
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Server running locally');
});
