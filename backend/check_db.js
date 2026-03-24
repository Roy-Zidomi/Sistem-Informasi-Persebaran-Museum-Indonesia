require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function check() {
  try {
    await client.connect();
    const res = await client.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log("=== TABLES ===");
    res.rows.forEach(r => console.log(`"${r.table_name}"`));
    
    // Let's also check column names if tables exist
    console.log("\n=== COLUMNS for 'provinsi' ===");
    try {
      const colRes = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'provinsi' OR table_name = 'Provinsi'");
      colRes.rows.forEach(r => console.log(r.column_name));
    } catch(e) {}
    
  } catch (e) {
    console.error("DB Error:", e.message);
  } finally {
    client.end();
  }
}
check();
