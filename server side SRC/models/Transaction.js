'use strict';

const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

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
    sequelize,
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

module.exports = Transaction;
