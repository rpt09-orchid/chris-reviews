const {Client } = require('pg');
//Setting up debugging environment and env variables
require('dotenv').config();
// const dbDebugger = require('debug')('app:db');

const connection = {
  user: process.env.RDS_USERNAME,
  host: process.env.RDS_HOST,
  database: process.env.RDS_DB_NAME,
  password: process.env.RDS_PASSWORD,
  port: process.env.RDS_PORT
}
// const connectionString = process.env.DB_URL;

// Connecting DB
const client = new Client(connection);

client.connect(() => {
  console.log('connected to db!');
});

module.exports = client;