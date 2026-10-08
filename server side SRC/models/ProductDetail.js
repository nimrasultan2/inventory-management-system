'use strict';

const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

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
    sequelize,
    modelName: 'ProductDetail',
    tableName: 'ProductDetails',
    timestamps: true,
  }
);

module.exports = ProductDetail;
