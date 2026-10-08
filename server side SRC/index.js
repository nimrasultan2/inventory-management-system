'use strict';

require('dotenv').config();

const app = require('./app');
const { initializeDatabase } = require('./config/database');

// Load models and wire associations before starting the server
require('./models/index');

const PORT = process.env.PORT || 5000;

async function start() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
