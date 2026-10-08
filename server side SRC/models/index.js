'use strict';

const { sequelize } = require('../config/database');

const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const ProductDetail = require('./ProductDetail');
const Transaction = require('./Transaction');
const TransactionItem = require('./TransactionItem');

/**
 * Registers all model associations.
 * Must be called once before any query that uses `include`.
 */
function setupAssociations() {
  // Category <-> Product
  Category.hasMany(Product, { foreignKey: 'categoryId', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
  Product.belongsTo(Category, { foreignKey: 'categoryId', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

  // Product <-> ProductDetail (one-to-one, cascade delete)
  Product.hasOne(ProductDetail, { foreignKey: 'productId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
  ProductDetail.belongsTo(Product, { foreignKey: 'productId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

  // User <-> Transaction
  User.hasMany(Transaction, { foreignKey: 'cashierId', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
  Transaction.belongsTo(User, { foreignKey: 'cashierId', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

  // Transaction <-> TransactionItem
  Transaction.hasMany(TransactionItem, { foreignKey: 'transactionId', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
  TransactionItem.belongsTo(Transaction, { foreignKey: 'transactionId', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

  // Product <-> TransactionItem
  Product.hasMany(TransactionItem, { foreignKey: 'productId', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
  TransactionItem.belongsTo(Product, { foreignKey: 'productId', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
}

setupAssociations();

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  ProductDetail,
  Transaction,
  TransactionItem,
};
