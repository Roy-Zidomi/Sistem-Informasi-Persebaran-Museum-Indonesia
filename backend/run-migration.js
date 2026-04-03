require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./src/config/db');

async function run() {
  try {
    const sqlPath = path.join(__dirname, 'migrations', '2026-04-03-add-museum-detail-fields.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await pool.query(sql);
    console.log('Migration executed successfully');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    pool.end();
  }
}

run();
