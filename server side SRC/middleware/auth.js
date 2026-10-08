'use strict';

const jwt = require('jsonwebtoken');

/**
 * Verifies the Bearer token in the Authorization header.
 * On success, attaches { id, role } to req.user and calls next().
 * On failure, responds 401 immediately.
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach only the claims the app needs — never the full payload
    req.user = { id: decoded.userId, role: decoded.role };
    next();
  } catch (err) {
    // Covers TokenExpiredError, JsonWebTokenError, NotBeforeError
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Returns middleware that allows only requests whose req.user.role
 * is in the given allowedRoles list.
 * Must be used AFTER verifyToken.
 *
 * @param {...string} allowedRoles
 * @returns {import('express').RequestHandler}
 */
function requireRole(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }
    next();
  };
}

module.exports = { verifyToken, requireRole };
