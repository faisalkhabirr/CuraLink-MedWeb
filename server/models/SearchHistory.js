import mongoose from 'mongoose';

// One user's personal search history. Never shared, never cached across users:
// every query against this collection is filtered by userId, which is the
// privacy boundary (same rule as the delete/export routes).
//
// Retention here is user-controlled: the user can delete single entries or
// clear everything (DELETE /api/search/history[/:id]). Unlike SearchCache
// there is no TTL - this is the user's own data, not a cache.
//
// NOTE: legacy rows live in the `searches` collection (see ./Search.js) and
// need a one-time migration into this model.
const searchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  query: {
    type: String,
    required: true,
  },
  response: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

export default SearchHistory;
