'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('Products', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
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
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      quantityInStock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      reorderThreshold: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      imageUrl: {
        type: DataTypes.STRING(2048),
        allowNull: true,
      },
      // timestamps: true  ?  createdAt + updatedAt
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    // Translate model validate: { min: 0 } to DB-level CHECK constraints
    await queryInterface.sequelize.query(
      'ALTER TABLE "Products" ADD CONSTRAINT "products_price_check" CHECK (price >= 0);'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE "Products" ADD CONSTRAINT "products_quantity_in_stock_check" CHECK ("quantityInStock" >= 0);'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE "Products" ADD CONSTRAINT "products_reorder_threshold_check" CHECK ("reorderThreshold" >= 0);'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Products');
  },
};
