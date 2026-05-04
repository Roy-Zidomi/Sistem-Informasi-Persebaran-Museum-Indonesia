require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./src/config/db');

async function run() {
  try {
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      const sqlPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(sqlPath, 'utf8');
      await pool.query(sql);
      console.log(`Migration executed: ${file}`);
    }

    console.log('All migrations executed successfully');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    pool.end();
  }
}

run();
