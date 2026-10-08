'use strict';

/**
 * Returns an Express middleware that validates required fields and optional
 * type rules on req.body.
 *
 * @param {string[]} required  - Field names that must be present and non-empty.
 * @param {Object}  [types={}] - { fieldName: 'string'|'number'|'boolean' }
 * @returns {import('express').RequestHandler}
 */
function validateBody(required = [], types = {}) {
  return function (req, res, next) {
    const missing = required.filter(
      (field) => req.body[field] === undefined || req.body[field] === null || req.body[field] === ''
    );
    if (missing.length > 0) {
      const err = new Error(`Missing required fields: ${missing.join(', ')}`);
      err.status = 400;
      return next(err);
    }

    for (const [field, expectedType] of Object.entries(types)) {
      const value = req.body[field];
      if (value === undefined || value === null) continue; // already caught above if required
      // eslint-disable-next-line valid-typeof
      if (typeof value !== expectedType) {
        const err = new Error(`Field "${field}" must be of type ${expectedType}`);
        err.status = 400;
        return next(err);
      }
    }

    next();
  };
}

module.exports = { validateBody };
