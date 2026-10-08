'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('Transactions', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      cashierId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      tax: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      // timestamps: true, updatedAt: false  ?  createdAt only
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    // Translate model validate: { min: 0 } to DB-level CHECK constraints
    await queryInterface.sequelize.query(
      'ALTER TABLE "Transactions" ADD CONSTRAINT "transactions_subtotal_check" CHECK (subtotal >= 0);'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE "Transactions" ADD CONSTRAINT "transactions_tax_check" CHECK (tax >= 0);'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE "Transactions" ADD CONSTRAINT "transactions_total_check" CHECK (total >= 0);'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Transactions');
  },
};
