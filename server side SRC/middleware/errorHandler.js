'use strict';

const { ValidationError, UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize');

/**
 * Centralized Express error-handling middleware.
 * Must be registered LAST (after all routes).
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Sequelize validation / constraint errors ? 400
  if (
    err instanceof ValidationError ||
    err instanceof UniqueConstraintError
  ) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors ? err.errors.map((e) => e.message) : [err.message],
    });
  }

  if (err instanceof ForeignKeyConstraintError) {
    return res.status(400).json({
      error: 'Foreign key constraint error',
      details: [err.message],
    });
  }

  // Explicit 404 (thrown by routes as { status: 404 })
  if (err.status === 404) {
    return res.status(404).json({ error: err.message || 'Not found' });
  }

  // Explicit 400 from input validation
  if (err.status === 400) {
    return res.status(400).json({ error: err.message || 'Bad request' });
  }

  // Fallback — 500, hide internals
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
}

module.exports = errorHandler;
