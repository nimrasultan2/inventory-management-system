'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('TransactionItems', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      transactionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Transactions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Products',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      unitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
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

    // Translate model validate: { min: 1 } / { min: 0.01 } to DB-level CHECK constraints
    await queryInterface.sequelize.query(
      'ALTER TABLE "TransactionItems" ADD CONSTRAINT "transaction_items_quantity_check" CHECK (quantity >= 1);'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE "TransactionItems" ADD CONSTRAINT "transaction_items_unit_price_check" CHECK ("unitPrice" >= 0.01);'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('TransactionItems');
  },
};
