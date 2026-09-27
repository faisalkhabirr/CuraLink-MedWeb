import mongoose from 'mongoose';

// LEGACY MODEL - DO NOT USE IN NEW CODE.
//
// This collection (`searches`) conflated two things: a shared answer cache and
// a user's personal history. It has been split into ./SearchCache.js (shared,
// TTL'd) and ./SearchHistory.js (per-user, user-deletable).
//
// The model is intentionally kept so the one-time migration script can still
// read the old rows and copy them into both new collections. Once that script
// has run everywhere, this file can be deleted.
const searchSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  query: {
    type: String,
    required: true
  },
  response: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  cachedAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes
searchSchema.index({ query: 1 });
searchSchema.index({ userId: 1 });

const Search = mongoose.model('Search', searchSchema);

export default Search;
