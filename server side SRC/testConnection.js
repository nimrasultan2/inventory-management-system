require('dotenv').config();
const { sequelize } = require('./config/database');

sequelize.authenticate()
  .then(() => console.log('Connection successful!'))
  .catch(err => console.error('Connection failed:', err));
  