const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = '7d';

function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: EXPIRES_IN });
}

function verifyToken(token) {
  const payload = jwt.verify(token, JWT_SECRET);
  return payload.sub; // userId
}

module.exports = { signToken, verifyToken };
