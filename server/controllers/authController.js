import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

// Issues a JWT for the given user. Expiry is intentionally unchanged (7d).
// tokenVersion travels in the payload so middleware can revoke old tokens.
const issueToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
      tokenVersion: user.tokenVersion ?? 0,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

// The only fields of a user document that may ever leave this controller.
const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar ?? null,
  createdAt: user.createdAt,
});

export const register = async (req, res) => {
  console.log('register', req.id, req.baseUrl + req.path);
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    const token = issueToken(user);

    res.status(201).json({ token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // password has select: false, so it must be requested explicitly here.
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = issueToken(user);

    res.status(200).json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// GET /api/auth/me - served from the database, never from the decoded JWT,
// and only with explicitly whitelisted, non-sensitive fields.
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email avatar createdAt');
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user no longer exists' });
    }

    return res.json(publicUser(user));
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ message: 'Server error while loading the current user' });
  }
};

// POST /api/auth/change-password - verifies the current password, then bumps
// tokenVersion so every previously issued token is rejected by the middleware.
// A fresh token is returned so the caller stays signed in on this device.
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user no longer exists' });
    }

    if (!user.password) {
      return res.status(400).json({ message: 'This account has no password set' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();

    const token = issueToken(user);

    return res.status(200).json({ token });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ message: 'Server error during password change' });
  }
};

// POST /api/auth/logout-all - revokes every token issued to this account,
// including the one used to make this call.
export const logoutEverywhere = async (req, res) => {
  try {
    const result = await User.updateOne(
      { _id: req.user.id },
      { $inc: { tokenVersion: 1 } }
    );

    if (result.matchedCount === 0) {
      return res.status(401).json({ message: 'Not authorized, user no longer exists' });
    }

    return res.json({ message: 'Signed out on all devices' });
  } catch (error) {
    console.error('Logout everywhere error:', error);
    return res.status(500).json({ message: 'Server error while signing out' });
  }
};
