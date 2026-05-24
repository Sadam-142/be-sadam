const { createClient } = require('@libsql/client');
require('dotenv').config();

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_API_KEY,
});

async function run() {
  const res = await client.execute(`
    SELECT id_pendaftaran, nama_lengkap, created_at
    FROM pendaftaran
    LIMIT 10;
  `);
  console.log(res.rows);
}

run().catch(console.error);
