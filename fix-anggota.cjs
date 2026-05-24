const { createClient } = require('@libsql/client');
require('dotenv').config();

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_API_KEY,
});

async function run() {
  console.log("Fetching data to fix no_anggota and created_at...");
  const res = await client.execute(`
    SELECT a.id_anggota, p.id_pendaftaran, p.angkatan, p.tgl_pendaftaran 
    FROM anggota a
    JOIN pendaftaran p ON a.id_pendaftaran = p.id_pendaftaran
    ORDER BY a.id_anggota ASC
  `);

  const counters = {};
  let updatedAnggota = 0;
  let updatedPendaftaran = 0;

  for (const row of res.rows) {
    const angkatan = row.angkatan || '2025';
    
    if (!counters[angkatan]) counters[angkatan] = 1;
    
    const noAnggota = `RSL-${angkatan}-${String(counters[angkatan]).padStart(4, '0')}`;
    counters[angkatan]++;

    // Update no_anggota
    await client.execute({
      sql: "UPDATE anggota SET no_anggota = ? WHERE id_anggota = ?",
      args: [noAnggota, row.id_anggota]
    });
    updatedAnggota++;

    // Update created_at in pendaftaran to match tgl_pendaftaran
    if (row.tgl_pendaftaran) {
      // row.tgl_pendaftaran is 'YYYY-MM-DD'
      const newCreatedAt = `${row.tgl_pendaftaran} 00:00:00`;
      await client.execute({
        sql: "UPDATE pendaftaran SET created_at = ? WHERE id_pendaftaran = ?",
        args: [newCreatedAt, row.id_pendaftaran]
      });
      updatedPendaftaran++;
    }
  }

  console.log(`Updated no_anggota for ${updatedAnggota} members with angkatan-based formatting.`);
  console.log(`Updated created_at for ${updatedPendaftaran} pendaftaran records to hide the time.`);
}

run().catch(console.error);
