'use strict';

const { Sequelize, DataTypes, Model } = require('sequelize');
const {
  setupTestDb,
  User,
  Category,
  Product,
  ProductDetail,
  Transaction,
  TransactionItem,
} = require('./setup');

// Feature: pos-inventory-backend-setup, Requirements 8.1–8.12

beforeAll(async () => {
  await setupTestDb();
});

// ─── Association existence ─────────────────────────────────────────────────────

describe('Association existence — all 10 pairs', () => {
  // Requirements 8.1, 8.2
  test('Category.associations.Products is defined (hasMany)', () => {
    expect(Category.associations.Products).toBeDefined();
    expect(Category.associations.Products.associationType).toBe('HasMany');
  });

  test('Product.associations.Category is defined (belongsTo)', () => {
    expect(Product.associations.Category).toBeDefined();
    expect(Product.associations.Category.associationType).toBe('BelongsTo');
  });

  // Requirements 8.3, 8.4
  test('Product.associations.ProductDetail is defined (hasOne)', () => {
    expect(Product.associations.ProductDetail).toBeDefined();
    expect(Product.associations.ProductDetail.associationType).toBe('HasOne');
  });

  test('ProductDetail.associations.Product is defined (belongsTo)', () => {
    expect(ProductDetail.associations.Product).toBeDefined();
    expect(ProductDetail.associations.Product.associationType).toBe('BelongsTo');
  });

  // Requirements 8.5, 8.6
  test('User.associations.Transactions is defined (hasMany)', () => {
    expect(User.associations.Transactions).toBeDefined();
    expect(User.associations.Transactions.associationType).toBe('HasMany');
  });

  test('Transaction.associations.User is defined (belongsTo)', () => {
    expect(Transaction.associations.User).toBeDefined();
    expect(Transaction.associations.User.associationType).toBe('BelongsTo');
  });

  // Requirements 8.7, 8.8
  test('Transaction.associations.TransactionItems is defined (hasMany)', () => {
    expect(Transaction.associations.TransactionItems).toBeDefined();
    expect(Transaction.associations.TransactionItems.associationType).toBe('HasMany');
  });

  test('TransactionItem.associations.Transaction is defined (belongsTo)', () => {
    expect(TransactionItem.associations.Transaction).toBeDefined();
    expect(TransactionItem.associations.Transaction.associationType).toBe('BelongsTo');
  });

  // Requirements 8.9, 8.10
  test('Product.associations.TransactionItems is defined (hasMany)', () => {
    expect(Product.associations.TransactionItems).toBeDefined();
    expect(Product.associations.TransactionItems.associationType).toBe('HasMany');
  });

  test('TransactionItem.associations.Product is defined (belongsTo)', () => {
    expect(TransactionItem.associations.Product).toBeDefined();
    expect(TransactionItem.associations.Product.associationType).toBe('BelongsTo');
  });
});

// ─── Foreign key names ─────────────────────────────────────────────────────────

describe('Association foreign key configuration', () => {
  test('Category→Product uses foreignKey "categoryId"', () => {
    expect(Category.associations.Products.foreignKey).toBe('categoryId');
  });

  test('Product→ProductDetail uses foreignKey "productId"', () => {
    expect(Product.associations.ProductDetail.foreignKey).toBe('productId');
  });

  test('User→Transaction uses foreignKey "cashierId"', () => {
    expect(User.associations.Transactions.foreignKey).toBe('cashierId');
  });

  test('Transaction→TransactionItem uses foreignKey "transactionId"', () => {
    expect(Transaction.associations.TransactionItems.foreignKey).toBe('transactionId');
  });

  test('Product→TransactionItem uses foreignKey "productId"', () => {
    expect(Product.associations.TransactionItems.foreignKey).toBe('productId');
  });
});

// ─── Eager-loading without associations throws ─────────────────────────────────

describe('Eager-loading without associations (Requirement 8.11)', () => {
  test('findAll with include on unassociated models throws an EagerLoadingError', async () => {
    // Create a completely isolated Sequelize instance — no associations registered
    const isolatedSequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    class IsolatedParent extends Model {}
    IsolatedParent.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
      },
      { sequelize: isolatedSequelize, modelName: 'IsolatedParent', tableName: 'IsolatedParents', timestamps: false }
    );

    class IsolatedChild extends Model {}
    IsolatedChild.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        parentId: { type: DataTypes.INTEGER, allowNull: true },
      },
      { sequelize: isolatedSequelize, modelName: 'IsolatedChild', tableName: 'IsolatedChildren', timestamps: false }
    );

    // Sync tables so the query has something to run against
    await isolatedSequelize.sync({ force: true });

    // Attempt eager-load with no association set up — must throw
    await expect(
      IsolatedParent.findAll({ include: [{ model: IsolatedChild }] })
    ).rejects.toThrow();

    await isolatedSequelize.close();
  });

  test('the error thrown by an unassociated include query is an EagerLoadingError', async () => {
    const { EagerLoadingError } = require('sequelize');

    const isolatedSequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    class Alpha extends Model {}
    Alpha.init(
      { id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true } },
      { sequelize: isolatedSequelize, modelName: 'Alpha', tableName: 'Alphas', timestamps: false }
    );

    class Beta extends Model {}
    Beta.init(
      { id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true } },
      { sequelize: isolatedSequelize, modelName: 'Beta', tableName: 'Betas', timestamps: false }
    );

    await isolatedSequelize.sync({ force: true });

    let caughtError;
    try {
      await Alpha.findAll({ include: [{ model: Beta }] });
    } catch (err) {
      caughtError = err;
    }

    expect(caughtError).toBeDefined();
    // Sequelize throws EagerLoadingError for unregistered associations
    expect(
      caughtError instanceof EagerLoadingError || caughtError.name === 'SequelizeEagerLoadingError'
    ).toBe(true);

    await isolatedSequelize.close();
  });
});
