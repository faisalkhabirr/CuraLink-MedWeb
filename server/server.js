import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import crypto from 'node:crypto';

// Import Routes
import authRoutes from './routes/auth.js';
import searchRoutes from './routes/search.js';

// Rate limiters (Redis-backed when REDIS_URL is set, see ./config/rateLimit.js)
import { authLimiter, searchLimiter } from './config/rateLimit.js';

const app = express();

// Trust exactly one proxy hop so req.ip - the rate limit key - is the real
// client IP. Vercel always sets X-Forwarded-For, and express-rate-limit throws
// ERR_ERL_UNEXPECTED_X_FORWARDED_FOR on every limited request while trust proxy
// is false. Must stay a number: `true` is rejected as too permissive.
app.set('trust proxy', 1);

// Request-ID middleware (mounted before every other middleware/route)
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
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

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);

// MongoDB Connection and Server Start
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// mongoose
//   .connect(MONGO_URI)
//   .then(() => {
//     console.log('MongoDB connected successfully');
//     app.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//     });
//   })
//   .catch((error) => {
//     console.error('Error connecting to MongoDB:', error.message);
//     process.exit(1);
//   });


mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((error) => console.error('Error connecting to MongoDB:', error.message));

export default app;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}
