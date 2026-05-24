const { createClient } = require('@libsql/client');
require('dotenv').config();

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_API_KEY,
});

async function run() {
  const updateRes = await client.execute(`
    UPDATE pendaftaran 
    SET fakultas = 'Sains dan Teknologi'
  `);
  console.log(`Updated fakultas for all members. Rows affected: ${updateRes.rowsAffected}`);
}

run().catch(console.error);
