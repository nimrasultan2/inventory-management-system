'use strict';

const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models/index');
const { validateBody } = require('../middleware/validate');

const router = Router();

const INVALID_CREDENTIALS_MSG = 'Invalid credentials';
const TOKEN_EXPIRY = '8h';

// -- POST /api/auth/login -----------------------------------------------------
router.post(
  '/login',
  validateBody(['email', 'password'], { email: 'string', password: 'string' }),
  async (req, res) => {
    const { email, password } = req.body;

    // Always run bcrypt.compare even on a miss so response time is constant
    // (prevents user-enumeration via timing difference)
    const user = await User.findOne({ where: { email } });

    // Use a throwaway hash when the user doesn't exist so timing stays uniform
    const hashToCompare = user ? user.passwordHash : '$2b$12$invalidhashpadding000000000000000000000000000000000000000';
    const passwordMatch = await bcrypt.compare(password, hashToCompare);

    if (!user || !passwordMatch || !user.isActive) {
      return res.status(401).json({ error: INVALID_CREDENTIALS_MSG });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    return res.json({ token });
  }
);

module.exports = router;
