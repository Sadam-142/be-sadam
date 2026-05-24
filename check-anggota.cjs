const { createClient } = require('@libsql/client');
require('dotenv').config();

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_API_KEY,
});

async function run() {
  const res = await client.execute(`
    SELECT a.id_anggota, p.id_pendaftaran, p.nama_lengkap, p.nim 
    FROM anggota a
    JOIN pendaftaran p ON a.id_pendaftaran = p.id_pendaftaran
    ORDER BY a.created_at DESC
    LIMIT 15;
  `);
  res.rows.forEach((r, i) => {
    console.log(`${i + 1}. ${r.nama_lengkap} (NIM: ${r.nim}, id_pendaftaran: ${r.id_pendaftaran})`);
  });
}

run().catch(console.error);
