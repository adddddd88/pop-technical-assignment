const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/response');
const { AuthRepository } = require('../modules/auth/auth.repository');
const { COOKIE_NAME } = require('../modules/auth/auth.controller');

const authRepository = new AuthRepository();

/**
 * Two-layer JWT authentication via httpOnly cookie.
 *
 * Layer 1 — jwt.verify()      (no I/O — rejects bad signature / expired)
 * Layer 2 — Redis exact match  (rejects logged-out or superseded sessions)
 */
const authMiddleware = async (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return sendError(res, 'AUTH_MISSING_TOKEN', 'No authentication token provided', 401);
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return sendError(res, 'SERVER_ERROR', 'JWT secret is not configured', 500);
  }

  // --- Layer 1: verify signature + expiry ---
  let decoded;
  try {
    decoded = jwt.verify(token, secret, { issuer: 'popcard-api' });
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return sendError(res, 'AUTH_TOKEN_EXPIRED', 'Token has expired', 401);
    }
    return sendError(res, 'AUTH_INVALID_TOKEN', 'Invalid token', 401);
  }

  // --- Layer 2: Redis presence + exact match ---
  try {
    const storedToken = await authRepository.getToken(decoded.enterpriseId);

    if (!storedToken) {
      return sendError(res, 'AUTH_SESSION_NOT_FOUND', 'Session not found or expired', 401);
    }

    if (storedToken !== token) {
      return sendError(res, 'AUTH_SESSION_SUPERSEDED', 'Session superseded by a newer login', 401);
    }
  } catch (err) {
    return sendError(res, 'AUTH_SERVICE_UNAVAILABLE', 'Authentication service unavailable', 503);
  }

  req.auth = decoded;
  next();
};

module.exports = { authMiddleware };