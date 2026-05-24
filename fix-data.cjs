const { createClient } = require('@libsql/client');
require('dotenv').config();

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_API_KEY,
});

async function run() {
  // 1. Fix IG name
  const igRes = await client.execute(`
    UPDATE pendaftaran 
    SET nama_akun_ig = 'nbla_293' 
    WHERE nama_akun_ig LIKE '%nbla_293%' AND nama_akun_ig LIKE '%instagram.com%'
  `);
  console.log(`Updated IG name. Rows affected: ${igRes.rowsAffected}`);

  // 2. Fix no_hp (must start with '08', otherwise set to NULL)
  // Let's first select to see how many
  const hpRes = await client.execute(`
    SELECT id_pendaftaran, no_hp 
    FROM pendaftaran 
    WHERE no_hp IS NOT NULL AND no_hp NOT LIKE '08%'
  `);
  
  console.log(`Found ${hpRes.rows.length} records with invalid no_hp.`);
  for (const row of hpRes.rows) {
    console.log(`Invalid HP: ${row.no_hp}`);
  }

  const updateHpRes = await client.execute(`
    UPDATE pendaftaran 
    SET no_hp = NULL 
    WHERE no_hp IS NOT NULL AND no_hp NOT LIKE '08%'
  `);
  console.log(`Cleared invalid no_hp. Rows affected: ${updateHpRes.rowsAffected}`);
}

run().catch(console.error);
