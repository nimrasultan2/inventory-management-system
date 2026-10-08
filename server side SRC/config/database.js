'use strict';

require('dotenv').config();

const { Sequelize } = require('sequelize');

// Synchronous startup guard — runs at module load time
const REQUIRED_VARS = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missing = REQUIRED_VARS.filter(
  (key) => !process.env[key] || process.env[key].trim() === ''
);

if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

// Construct the Sequelize instance using environment variables
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    dialect: 'postgres',
    logging: false,
  }
);

/**
 * Verifies the database connection at server startup.
 * Logs success or exits the process with code 1 on failure.
 *
 * @returns {Promise<void>}
 */
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');
  } catch (err) {
    console.error('Unable to connect to the database:', err.message);
    process.exit(1);
  }
}

module.exports = {
  sequelize,
  initializeDatabase,
};
