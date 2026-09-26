import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  console.log('protect', req.id, req.baseUrl + req.path);

  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  const token = header.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  // 1. Signature / expiry check (unchanged).
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }

  if (!decoded?.id) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }

  // 2. Session revocation check: the token's version must still match the
  //    user's current version in the database. Password change / log out
  //    everywhere bump that version and invalidate every older token.
  let user;
  try {
    user = await User.findById(decoded.id).select('tokenVersion');
  } catch (error) {
    console.error('Session lookup error:', error.message);
    return res.status(500).json({ message: 'Server error while validating session' });
  }

  if (!user) {
    return res.status(401).json({ message: 'Not authorized, user no longer exists' });
  }

  // Tokens minted before tokenVersion existed carry no claim -> treat as 0,
  // so the deploy itself does not sign everyone out.
  const tokenVersion = decoded.tokenVersion ?? 0;
  if (user.tokenVersion !== tokenVersion) {
    return res.status(401).json({ message: 'Not authorized, session revoked' });
  }

  // Attach decoded user to req.user
  req.user = decoded;

  return next();
};

export default protect;
