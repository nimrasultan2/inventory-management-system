'use strict';

const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

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
    sequelize,
    modelName: 'TransactionItem',
    tableName: 'TransactionItems',
    timestamps: true,
  }
);

module.exports = TransactionItem;
