const { createClient } = require('@libsql/client');
require('dotenv').config();

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_API_KEY,
});

async function run() {
  await client.execute(`UPDATE pendaftaran SET nim = NULL WHERE id_pendaftaran = 43;`); // Abdan
  console.log("Cleared NIM for Abdan");
  
  // Just in case, I will also check id_pendaftaran = 42 (Zada)
  // Let's not clear Zada's NIM unless requested.
}

run().catch(console.error);
