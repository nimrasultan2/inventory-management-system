'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('ProductDetails', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      // unique:true enforces the one-to-one relationship at the DB level
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'Products',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',  // deleting a Product removes its detail row
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ProductDetails');
  },
};
