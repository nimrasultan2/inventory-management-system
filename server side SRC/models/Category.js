'use strict';

const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

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
    sequelize,
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

module.exports = Category;
