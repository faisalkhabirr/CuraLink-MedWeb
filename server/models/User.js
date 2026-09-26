import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    // Never selected by default: a password hash must only ever be loaded
    // deliberately (e.g. User.findOne(...).select('+password') when comparing).
    select: false
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  avatar: {
    type: String
  },
  // Bumped on password change and on "log out everywhere". Every JWT carries
  // the version it was issued with; auth middleware rejects tokens whose
  // version no longer matches, which revokes all previously issued tokens.
  tokenVersion: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

export default User;
