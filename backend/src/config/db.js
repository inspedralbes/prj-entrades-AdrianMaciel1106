const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../../.env' }); // Adjust path based on execution context

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'password_1234',
  database: process.env.DB_NAME || 'entrades_realtime',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
