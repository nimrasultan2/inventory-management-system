'use strict';

const path = require('path');
const express = require('express');
const cors = require('cors');

const authRouter           = require('./routes/auth');
const usersRouter          = require('./routes/users');
const categoriesRouter     = require('./routes/categories');
const productsRouter       = require('./routes/products');
const productDetailsRouter = require('./routes/productDetails');
const transactionsRouter   = require('./routes/transactions');
const errorHandler         = require('./middleware/errorHandler');

const app = express();

// -- Static files --------------------------------------------------------------
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// -- Middleware ----------------------------------------------------------------
app.use(cors());
app.use(express.json());

// -- Routes --------------------------------------------------------------------
app.use('/api/auth',            authRouter);
app.use('/api/users',           usersRouter);
app.use('/api/categories',      categoriesRouter);
app.use('/api/products',        productsRouter);
app.use('/api/product-details', productDetailsRouter);
app.use('/api/transactions',    transactionsRouter);

// -- Health check --------------------------------------------------------------
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// -- 404 catch-all -------------------------------------------------------------
app.use((req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.status = 404;
  next(err);
});

// -- Centralized error handler (must be last) ----------------------------------
app.use(errorHandler);

module.exports = app;
