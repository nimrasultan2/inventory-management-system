'use strict';

const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

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
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true,
  }
);

module.exports = User;
