'use strict';

const { Router } = require('express');
const { ProductDetail, Product } = require('../models/index');
const { validateBody } = require('../middleware/validate');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = Router();

const authAny    = [verifyToken];
const authManage = [verifyToken, requireRole('ADMIN', 'INVENTORY_MANAGER')];

const DETAIL_INCLUDE = [{ model: Product, as: 'Product' }];

// -- GET /api/product-details -------------------------------------------------
router.get('/', authAny, async (req, res) => {
  const details = await ProductDetail.findAll({ include: DETAIL_INCLUDE });
  res.json(details);
});

// -- GET /api/product-details/:id ---------------------------------------------
router.get('/:id', authAny, async (req, res, next) => {
  const detail = await ProductDetail.findByPk(req.params.id, { include: DETAIL_INCLUDE });
  if (!detail) {
    const err = new Error('ProductDetail not found');
    err.status = 404;
    return next(err);
  }
  res.json(detail);
});

// -- POST /api/product-details ------------------------------------------------
router.post(
  '/',
  ...authManage,
  validateBody(['productId']),
  async (req, res) => {
    const {
      productId, expiryDate, storageTemp, warrantyPeriod,
      serialNumber, isFragile, isHazardous, handlingNote, safetyNote,
    } = req.body;

    const detail = await ProductDetail.create({
      productId,
      expiryDate:    expiryDate    ?? null,
      storageTemp:   storageTemp   ?? null,
      warrantyPeriod: warrantyPeriod ?? null,
      serialNumber:  serialNumber  ?? null,
      isFragile:     isFragile     ?? null,
      isHazardous:   isHazardous   ?? null,
      handlingNote:  handlingNote  ?? null,
      safetyNote:    safetyNote    ?? null,
    });
    const full = await ProductDetail.findByPk(detail.id, { include: DETAIL_INCLUDE });
    res.status(201).json(full);
  }
);

// -- PUT /api/product-details/:id ---------------------------------------------
router.put('/:id', ...authManage, async (req, res, next) => {
  const detail = await ProductDetail.findByPk(req.params.id);
  if (!detail) {
    const err = new Error('ProductDetail not found');
    err.status = 404;
    return next(err);
  }

  const {
    expiryDate, storageTemp, warrantyPeriod, serialNumber,
    isFragile, isHazardous, handlingNote, safetyNote,
  } = req.body;

  await detail.update({
    expiryDate:    expiryDate    !== undefined ? expiryDate    : detail.expiryDate,
    storageTemp:   storageTemp   !== undefined ? storageTemp   : detail.storageTemp,
    warrantyPeriod: warrantyPeriod !== undefined ? warrantyPeriod : detail.warrantyPeriod,
    serialNumber:  serialNumber  !== undefined ? serialNumber  : detail.serialNumber,
    isFragile:     isFragile     !== undefined ? isFragile     : detail.isFragile,
    isHazardous:   isHazardous   !== undefined ? isHazardous   : detail.isHazardous,
    handlingNote:  handlingNote  !== undefined ? handlingNote  : detail.handlingNote,
    safetyNote:    safetyNote    !== undefined ? safetyNote    : detail.safetyNote,
  });

  const full = await ProductDetail.findByPk(detail.id, { include: DETAIL_INCLUDE });
  res.json(full);
});

// -- DELETE /api/product-details/:id ------------------------------------------
router.delete('/:id', ...authManage, async (req, res, next) => {
  const detail = await ProductDetail.findByPk(req.params.id);
  if (!detail) {
    const err = new Error('ProductDetail not found');
    err.status = 404;
    return next(err);
  }
  await detail.destroy();
  res.status(204).send();
});

module.exports = router;
