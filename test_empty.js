require('dotenv').config();
const mysql = require('mysql2/promise');

async function testEmptyPass() {
  try {
    const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '' });
    await pool.query('SELECT 1');
    console.log('✅ Success with empty password');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed with empty password:', err.message);
    process.exit(1);
  }
}

testEmptyPass();
