'use strict';

require('dotenv').config();
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const email = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error(
        'SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env before running this seeder.'
      );
    }

    // Check whether an Admin already exists so the seeder is safe to re-run
    const [existing] = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" WHERE email = :email LIMIT 1`,
      { replacements: { email }, type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (existing) {
      console.log(`Admin user "${email}" already exists — skipping.`);
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const now = new Date();

    await queryInterface.bulkInsert('Users', [
      {
        email,
        passwordHash,
        fullName: 'System Admin',
        role: 'ADMIN',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    console.log(`Admin user "${email}" created.`);
  },

  async down(queryInterface) {
    const email = process.env.SEED_ADMIN_EMAIL;
    if (email) {
      await queryInterface.bulkDelete('Users', { email }, {});
    }
  },
};
