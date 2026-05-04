require('dotenv').config();
const { Client } = require('pg');
const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
client.connect().then(async () => {
  const res = await client.query('SELECT id, nama_museum FROM museum ORDER BY id ASC LIMIT 1');
  console.log(res.rows);
  if (res.rows.length > 0) {
    await client.query('UPDATE museum SET virtual_tour_url = $1, livecam_url = $2 WHERE id = $3', ['https://pannellum.org/images/alma.jpg', 'https://www.youtube.com/embed/jfKfPfyJRdk', res.rows[0].id]);
    console.log('Updated museum ' + res.rows[0].id);
  }
  client.end();
}).catch(err => {
  console.error(err);
  client.end();
});
