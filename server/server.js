import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

// Import Routes
import authRoutes from './routes/auth.js';
import searchRoutes from './routes/search.js';

const app = express();

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

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Apply rate limiter to all /api routes
// app.use('/api/', apiLimiter);

// Mount Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/search', searchRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/', apiLimiter);

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