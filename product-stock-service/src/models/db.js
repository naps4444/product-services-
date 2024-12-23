const knex = require('knex');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Initialize Knex.js
const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});

module.exports = db;
