const { Pool } = require('pg');
//Setting up debugging environment and env variables
require('dotenv').config();


const connection = {
  user: process.env.DB_USER,
  host: process.env.HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT
};

// Connecting DB
const pool = new Pool(connection);

module.exports = pool;