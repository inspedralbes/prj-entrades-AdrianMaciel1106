require('dotenv').config(); // Should load .env from CWD
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_USER:', process.env.DB_USER);
  console.log('DB_PASS:', process.env.DB_PASS ? '****' : 'UNDEFINED');
  
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME
    });
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('✅ Connection successful:', rows[0].result);
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }
}

testConnection();
