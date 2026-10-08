'use strict';

const { Router } = require('express');
const { sequelize, Transaction, TransactionItem, Product, Category, User } = require('../models/index');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = Router();

const TAX_RATE = 0.05; // 5% flat

// All routes require a valid token
router.use(verifyToken);

// Shared include shape used by both GET routes (for receipt / report display)
const TRANSACTION_INCLUDE = [
  {
    model: TransactionItem,
    as: 'TransactionItems',
    include: [
      {
        model: Product,
        as: 'Product',
        attributes: ['id', 'sku', 'name', 'imageUrl'],
        include: [{ model: Category, as: 'Category', attributes: ['id', 'name'] }],
      },
    ],
  },
  {
    model: User,
    as: 'User',
    attributes: ['id', 'fullName', 'email', 'role'],
  },
];

// -- POST /api/transactions ----------------------------------------------------
// Any authenticated role can check out. Price and totals are always server-side.
router.post('/', async (req, res, next) => {
  const { items } = req.body;

  // --- Input validation -------------------------------------------------------
  if (!Array.isArray(items) || items.length === 0) {
    const err = new Error('Request body must contain a non-empty "items" array');
    err.status = 400;
    return next(err);
  }

  for (const [i, item] of items.entries()) {
    if (!item.productId || !Number.isInteger(item.productId)) {
      const err = new Error(`items[${i}].productId must be an integer`);
      err.status = 400;
      return next(err);
    }
    if (!item.quantity || !Number.isInteger(item.quantity) || item.quantity < 1) {
      const err = new Error(`items[${i}].quantity must be a positive integer`);
      err.status = 400;
      return next(err);
    }
  }

  // --- Atomic checkout --------------------------------------------------------
  let createdTransaction;

  try {
    createdTransaction = await sequelize.transaction(async (t) => {
      // a) Lock product rows FOR UPDATE in ascending productId order.
      //    A consistent lock-acquisition order across all concurrent transactions
      //    prevents deadlocks caused by two sessions locking the same rows in
      //    opposite orders.
      const sortedItems = [...items].sort((a, b) => a.productId - b.productId);

      const lockedRows = await Promise.all(
        sortedItems.map((item) =>
          Product.findByPk(item.productId, { lock: true, transaction: t })
        )
      );

      // Build a map so the rest of the logic can look up by productId without
      // depending on array position (items may be in a different order than sortedItems).
      const productById = new Map();
      for (let i = 0; i < sortedItems.length; i++) {
        productById.set(sortedItems[i].productId, lockedRows[i]);
      }

      // b) Stock check — collect ALL failures before aborting so the message is useful
      const stockErrors = [];
      for (const item of items) {
        const product = productById.get(item.productId);
        if (!product) {
          stockErrors.push(`Product with id ${item.productId} not found`);
          continue;
        }
        if (product.quantityInStock < item.quantity) {
          stockErrors.push(
            `Insufficient stock for "${product.name}" ` +
            `(requested ${item.quantity}, available ${product.quantityInStock})`
          );
        }
      }

      if (stockErrors.length > 0) {
        // Throwing inside sequelize.transaction() triggers automatic rollback
        const err = new Error(stockErrors.join('; '));
        err.status = 400;
        throw err;
      }

      // c) Calculate totals entirely from DB prices — never from request body
      let subtotalCents = 0; // work in cents to avoid float drift
      for (const item of items) {
        const price = Math.round(parseFloat(productById.get(item.productId).price) * 100);
        subtotalCents += price * item.quantity;
      }
      const subtotal = subtotalCents / 100;
      const tax      = Math.round(subtotal * TAX_RATE * 100) / 100;
      const total    = Math.round((subtotal + tax) * 100) / 100;

      // d) Create the Transaction header row
      const txn = await Transaction.create(
        { cashierId: req.user.id, subtotal, tax, total },
        { transaction: t }
      );

      // e) Create one TransactionItem per cart line — unitPrice from DB
      await Promise.all(
        items.map((item) =>
          TransactionItem.create(
            {
              transactionId: txn.id,
              productId:     item.productId,
              quantity:      item.quantity,
              unitPrice:     parseFloat(productById.get(item.productId).price),
            },
            { transaction: t }
          )
        )
      );

      // f) Decrement stock atomically on each locked row
      await Promise.all(
        items.map((item) =>
          productById.get(item.productId).decrement('quantityInStock', {
            by: item.quantity,
            transaction: t,
          })
        )
      );

      return txn;
    });
  } catch (err) {
    // Sequelize rolls back automatically; forward the error to errorHandler
    return next(err);
  }

  // g) Reload the committed row with full receipt details and return 201
  const full = await Transaction.findByPk(createdTransaction.id, {
    include: TRANSACTION_INCLUDE,
  });
  return res.status(201).json(full);
});

// -- GET /api/transactions/my -------------------------------------------------
// Registered BEFORE /:id so "my" is never matched as a numeric id
router.get('/my', async (req, res) => {
  const transactions = await Transaction.findAll({
    where: { cashierId: req.user.id },
    include: TRANSACTION_INCLUDE,
    order: [['createdAt', 'DESC']],
  });
  res.json(transactions);
});

// -- GET /api/transactions -----------------------------------------------------
// Admin and Inventory Manager only — store-wide reporting view
router.get(
  '/',
  requireRole('ADMIN', 'INVENTORY_MANAGER'),
  async (req, res) => {
    const transactions = await Transaction.findAll({
      include: TRANSACTION_INCLUDE,
      order: [['createdAt', 'DESC']],
    });
    res.json(transactions);
  }
);

module.exports = router;
