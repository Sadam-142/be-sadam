const { createClient } = require('@libsql/client');
require('dotenv').config();

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_API_KEY,
});

async function run() {
  const res = await client.execute(`SELECT id_pendaftaran, created_at FROM pendaftaran`);
  for (const row of res.rows) {
    if (row.created_at && row.created_at.length > 19) {
      const fixed = row.created_at.substring(0, 19); // "2026-05-12 22:09:52" or "2025-08-20 00:00:00"
      await client.execute({
        sql: "UPDATE pendaftaran SET created_at = ? WHERE id_pendaftaran = ?",
        args: [fixed, row.id_pendaftaran]
      });
    }
  }
  console.log("Fixed created_at format.");
}

run().catch(console.error);
