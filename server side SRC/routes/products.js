'use strict';

const { Router } = require('express');
const { Op } = require('sequelize');
const multer = require('multer');

const {
  sequelize,
  Product,
  Category,
  ProductDetail
} = require('../models/index');

const { validateBody } = require('../middleware/validate');
const { verifyToken, requireRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = Router();

const authAny = [verifyToken];
const authManage = [
  verifyToken,
  requireRole('ADMIN', 'INVENTORY_MANAGER')
];

// Fields included on every full Product response
const PRODUCT_INCLUDE = [
  {
    model: Category,
    as: 'Category'
  },
  {
    model: ProductDetail,
    as: 'ProductDetail',
    required: false
  }
];

// Add expiringSoon flag to product response
const addExpiryFlag = (product) => {
  const plain = product.toJSON();

  const categoryName = plain.Category?.name?.toLowerCase();
  const expiryDate = plain.ProductDetail?.expiryDate;

  plain.expiringSoon = false;

  if (categoryName === 'cold' && expiryDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const threeDaysFromToday = new Date(today);
    threeDaysFromToday.setDate(today.getDate() + 3);

    plain.expiringSoon = expiry <= threeDaysFromToday;
  }

  return plain;
};

// -----------------------------------------------------------------------------
// GET /api/products/low-stock
// -----------------------------------------------------------------------------

// Registered BEFORE /:id so "low-stock" is never treated as a numeric id
router.get('/low-stock', authAny, async (req, res, next) => {
  try {
    const products = await Product.findAll({
      where: {
        quantityInStock: {
          [Op.lte]: sequelize.col('reorderThreshold')
        }
      },
      include: PRODUCT_INCLUDE,
      order: [['name', 'ASC']]
    });

    res.json(products.map(addExpiryFlag));
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------------
// GET /api/products
// -----------------------------------------------------------------------------

router.get('/', authAny, async (req, res, next) => {
  try {
    const { name, sku, categoryId } = req.query;

    const where = {};

    if (name) {
      where.name = {
        [Op.iLike]: `%${name}%`
      };
    }

    if (sku) {
      where.sku = {
        [Op.iLike]: `%${sku}%`
      };
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const products = await Product.findAll({
      where,
      include: PRODUCT_INCLUDE,
      order: [['name', 'ASC']]
    });

    res.json(products.map(addExpiryFlag));
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------------
// GET /api/products/:id
// -----------------------------------------------------------------------------

router.get('/:id', authAny, async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: PRODUCT_INCLUDE
    });

    if (!product) {
      const err = new Error('Product not found');
      err.status = 404;
      return next(err);
    }

    res.json(addExpiryFlag(product));
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------------
// POST /api/products
// -----------------------------------------------------------------------------

router.post(
  '/',
  ...authManage,

  validateBody(
    ['sku', 'name', 'categoryId', 'price', 'reorderThreshold'],
    {
      sku: 'string',
      name: 'string',
      price: 'number',
      reorderThreshold: 'number'
    }
  ),

  async (req, res, next) => {
    try {
      const {
        sku,
        name,
        categoryId,
        price,
        quantityInStock,
        reorderThreshold,
        description,
        imageUrl
      } = req.body;

      const product = await Product.create({
        sku,
        name,
        categoryId,
        price,
        quantityInStock: quantityInStock ?? 0,
        reorderThreshold,
        description: description ?? null,
        imageUrl: imageUrl ?? null
      });

      const full = await Product.findByPk(product.id, {
        include: PRODUCT_INCLUDE
      });

      res.status(201).json(addExpiryFlag(full));
    } catch (err) {
      next(err);
    }
  }
);

// -----------------------------------------------------------------------------
// POST /api/products/:id/image
// -----------------------------------------------------------------------------

router.post(
  '/:id/image',
  ...authManage,

  // Run Multer inline so its errors flow into our centralized error handler
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (!err) {
        return next();
      }

      if (
        err instanceof multer.MulterError &&
        err.code === 'LIMIT_FILE_SIZE'
      ) {
        const e = new Error(
          'File too large - maximum size is 5 MB'
        );
        e.status = 400;
        return next(e);
      }

      // fileFilter rejection carries err.status = 400 already
      if (!err.status) {
        err.status = 400;
      }

      return next(err);
    });
  },

  async (req, res, next) => {
    try {
      if (!req.file) {
        const err = new Error(
          'No image file provided - use field name "image"'
        );
        err.status = 400;
        return next(err);
      }

      const product = await Product.findByPk(req.params.id);

      if (!product) {
        const err = new Error('Product not found');
        err.status = 404;
        return next(err);
      }

      const imageUrl = `/uploads/${req.file.filename}`;

      await product.update({
        imageUrl
      });

      const full = await Product.findByPk(product.id, {
        include: PRODUCT_INCLUDE
      });

      res.json(addExpiryFlag(full));
    } catch (err) {
      next(err);
    }
  }
);

// -----------------------------------------------------------------------------
// PUT /api/products/:id
// -----------------------------------------------------------------------------

router.put(
  '/:id',
  ...authManage,

  validateBody(
    ['sku', 'name', 'categoryId', 'price', 'reorderThreshold'],
    {
      sku: 'string',
      name: 'string',
      price: 'number',
      reorderThreshold: 'number'
    }
  ),

  async (req, res, next) => {
    try {
      const product = await Product.findByPk(req.params.id);

      if (!product) {
        const err = new Error('Product not found');
        err.status = 404;
        return next(err);
      }

      const {
        sku,
        name,
        categoryId,
        price,
        quantityInStock,
        reorderThreshold,
        description,
        imageUrl
      } = req.body;

      await product.update({
        sku,
        name,
        categoryId,
        price,
        quantityInStock:
          quantityInStock ?? product.quantityInStock,
        reorderThreshold,
        description:
          description ?? product.description,
        imageUrl:
          imageUrl ?? product.imageUrl
      });

      const full = await Product.findByPk(product.id, {
        include: PRODUCT_INCLUDE
      });

      res.json(addExpiryFlag(full));
    } catch (err) {
      next(err);
    }
  }
);

// -----------------------------------------------------------------------------
// DELETE /api/products/:id
// -----------------------------------------------------------------------------

router.delete(
  '/:id',
  ...authManage,
  async (req, res, next) => {
    try {
      const product = await Product.findByPk(req.params.id);

      if (!product) {
        const err = new Error('Product not found');
        err.status = 404;
        return next(err);
      }

      await product.destroy();

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;