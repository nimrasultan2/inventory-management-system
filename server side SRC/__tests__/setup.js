'use strict';

const { Sequelize, DataTypes, Model } = require('sequelize');

// Create an in-memory SQLite sequelize instance for tests
const testSequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false,
});

// ─── User ────────────────────────────────────────────────────────────────────

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        notNull: { msg: 'email cannot be null' },
        notEmpty: { msg: 'email cannot be empty' },
      },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: { msg: 'passwordHash cannot be null' },
        notEmpty: { msg: 'passwordHash cannot be empty' },
      },
    },
    fullName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: { msg: 'fullName cannot be null' },
        notEmpty: { msg: 'fullName cannot be empty' },
      },
    },
    role: {
      type: DataTypes.ENUM('ADMIN', 'INVENTORY_MANAGER', 'CASHIER'),
      allowNull: false,
      validate: {
        notNull: { msg: 'role cannot be null' },
        notEmpty: { msg: 'role cannot be empty' },
        isIn: {
          args: [['ADMIN', 'INVENTORY_MANAGER', 'CASHIER']],
          msg: 'role must be one of ADMIN, INVENTORY_MANAGER, CASHIER',
        },
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize: testSequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true,
  }
);

// ─── Category ────────────────────────────────────────────────────────────────

class Category extends Model {}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize: testSequelize,
    modelName: 'Category',
    tableName: 'Categories',
    timestamps: false,
    hooks: {
      beforeValidate(instance) {
        if (typeof instance.name === 'string') {
          instance.name = instance.name.trim().toLowerCase();
        }
      },
    },
  }
);

// ─── Product ─────────────────────────────────────────────────────────────────

class Product extends Model {}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sku: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Categories',
        key: 'id',
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    quantityInStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    reorderThreshold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING(2048),
      allowNull: true,
    },
  },
  {
    sequelize: testSequelize,
    modelName: 'Product',
    tableName: 'Products',
    timestamps: true,
  }
);

// ─── ProductDetail ────────────────────────────────────────────────────────────

class ProductDetail extends Model {}

ProductDetail.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    expiryDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    storageTemp: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    warrantyPeriod: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    serialNumber: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    isFragile: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    isHazardous: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    handlingNote: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    safetyNote: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize: testSequelize,
    modelName: 'ProductDetail',
    tableName: 'ProductDetails',
    timestamps: true,
  }
);

// ─── Transaction ──────────────────────────────────────────────────────────────

class Transaction extends Model {}

Transaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cashierId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
  },
  {
    sequelize: testSequelize,
    modelName: 'Transaction',
    tableName: 'Transactions',
    timestamps: true,
    updatedAt: false,
    validate: {
      totalEqualsSubtotalPlusTax() {
        const sub = parseFloat(this.subtotal);
        const tax = parseFloat(this.tax);
        const total = parseFloat(this.total);
        if (Math.abs(total - (sub + tax)) > 0.001) {
          throw new Error('total must equal subtotal + tax');
        }
      },
    },
  }
);

// ─── TransactionItem ──────────────────────────────────────────────────────────

class TransactionItem extends Model {}

TransactionItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    transactionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
  },
  {
    sequelize: testSequelize,
    modelName: 'TransactionItem',
    tableName: 'TransactionItems',
    timestamps: true,
  }
);

// ─── Associations ─────────────────────────────────────────────────────────────

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

// ─── setupTestDb ──────────────────────────────────────────────────────────────

/**
 * Drops and recreates all tables, then enables FK enforcement for SQLite.
 * Call this in `beforeAll` (or `beforeEach` for full isolation) in each test suite.
 */
async function setupTestDb() {
  await testSequelize.sync({ force: true });
  await testSequelize.query('PRAGMA foreign_keys = ON');
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  testSequelize,
  setupTestDb,
  User,
  Category,
  Product,
  ProductDetail,
  Transaction,
  TransactionItem,
};
