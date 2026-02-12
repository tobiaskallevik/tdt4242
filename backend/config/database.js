// Database configuration – Sequelize instance
// Solves Req 8 (data layer for auth) and general DB connectivity
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'ai_guidebook',
  process.env.DB_USER || 'ai_guidebook_user',
  process.env.DB_PASS || 'ai_guidebook_pass',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

module.exports = sequelize;
