'use strict';

const { Router } = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../models/index');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

const router = Router();

const SALT_ROUNDS = 12;
const VALID_ROLES = ['ADMIN', 'INVENTORY_MANAGER', 'CASHIER'];

// Columns returned on every user response — passwordHash is never included
const USER_ATTRIBUTES = ['id', 'email', 'fullName', 'role', 'isActive', 'createdAt'];

// -- GET /api/users/me --------------------------------------------------------
// Any authenticated role. Registered BEFORE router.use(requireRole('ADMIN'))
// so it is not subject to the Admin-only guard below.
router.get('/me', verifyToken, async (req, res, next) => {
  const user = await User.findByPk(req.user.id, {
    attributes: ['id', 'email', 'fullName', 'role'],
  });
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    return next(err);
  }
  res.json(user);
});

// All routes below this line require a valid token AND Admin role
router.use(verifyToken, requireRole('ADMIN'));

// -- GET /api/users -----------------------------------------------------------
// Returns all users ordered by createdAt DESC. Never includes passwordHash.
router.get('/', async (req, res) => {
  const users = await User.findAll({
    attributes: USER_ATTRIBUTES,
    order: [['createdAt', 'DESC']],
  });
  res.json(users);
});

// -- PATCH /api/users/:id -----------------------------------------------------
// Updates role and/or isActive on an existing user.
router.patch('/:id', async (req, res, next) => {
  const { role, isActive } = req.body;

  // At least one field must be present
  if (role === undefined && isActive === undefined) {
    const err = new Error('Request body must include at least one of: role, isActive');
    err.status = 400;
    return next(err);
  }

  // Validate role if provided
  if (role !== undefined && !VALID_ROLES.includes(role)) {
    const err = new Error(`role must be one of: ${VALID_ROLES.join(', ')}`);
    err.status = 400;
    return next(err);
  }

  // Validate isActive type if provided
  if (isActive !== undefined && typeof isActive !== 'boolean') {
    const err = new Error('isActive must be a boolean');
    err.status = 400;
    return next(err);
  }

  const user = await User.findByPk(req.params.id);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    return next(err);
  }

  const updates = {};
  if (role     !== undefined) updates.role     = role;
  if (isActive !== undefined) updates.isActive = isActive;

  await user.update(updates);

  res.json({
    id:        user.id,
    email:     user.email,
    fullName:  user.fullName,
    role:      user.role,
    isActive:  user.isActive,
    createdAt: user.createdAt,
  });
});

// -- POST /api/users ----------------------------------------------------------
// Creates a new user account. Password is hashed before storing.
router.post(
  '/',
  validateBody(
    ['email', 'password', 'fullName', 'role'],
    { email: 'string', password: 'string', fullName: 'string', role: 'string' }
  ),
  async (req, res, next) => {
    const { email, password, fullName, role } = req.body;

    if (!VALID_ROLES.includes(role)) {
      const err = new Error(`role must be one of: ${VALID_ROLES.join(', ')}`);
      err.status = 400;
      return next(err);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({ email, passwordHash, fullName, role });

    // Never return the hash in the response
    return res.status(201).json({
      id:        user.id,
      email:     user.email,
      fullName:  user.fullName,
      role:      user.role,
      isActive:  user.isActive,
      createdAt: user.createdAt,
    });
  }
);

module.exports = router;
