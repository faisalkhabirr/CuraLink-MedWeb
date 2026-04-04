import mongoose from 'mongoose';

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
