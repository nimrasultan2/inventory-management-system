'use strict';

const { Router } = require('express');
const { Category } = require('../models/index');
const { validateBody } = require('../middleware/validate');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = Router();

// Shorthand middleware stacks
const authAny    = [verifyToken];
const authManage = [verifyToken, requireRole('ADMIN', 'INVENTORY_MANAGER')];

// -- GET /api/categories ------------------------------------------------------
router.get('/', authAny, async (req, res) => {
  const categories = await Category.findAll({ order: [['name', 'ASC']] });
  res.json(categories);
});

// -- GET /api/categories/:id --------------------------------------------------
router.get('/:id', authAny, async (req, res, next) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) {
    const err = new Error('Category not found');
    err.status = 404;
    return next(err);
  }
  res.json(category);
});

// -- POST /api/categories -----------------------------------------------------
router.post(
  '/',
  ...authManage,
  validateBody(['name'], { name: 'string' }),
  async (req, res) => {
    const category = await Category.create({ name: req.body.name });
    res.status(201).json(category);
  }
);

// -- PUT /api/categories/:id --------------------------------------------------
router.put(
  '/:id',
  ...authManage,
  validateBody(['name'], { name: 'string' }),
  async (req, res, next) => {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      const err = new Error('Category not found');
      err.status = 404;
      return next(err);
    }
    await category.update({ name: req.body.name });
    res.json(category);
  }
);

// -- DELETE /api/categories/:id -----------------------------------------------
router.delete('/:id', ...authManage, async (req, res, next) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) {
    const err = new Error('Category not found');
    err.status = 404;
    return next(err);
  }
  await category.destroy();
  res.status(204).send();
});

module.exports = router;
