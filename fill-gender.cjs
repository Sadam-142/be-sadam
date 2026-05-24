const { createClient } = require('@libsql/client');
require('dotenv').config();

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_API_KEY,
});

const boys = [
  "M.RIKZA ALIFIIKA",
  "Muhammad kholil fauzan",
  "Muhammad Wildan Ainur Rosyad",
  "Mukhammad Fahmi Nur Khakim",
  "Wildan Fahmi Al Ikfa",
  "Muhammad Danda Kholilurrohman",
  "Abdan Mujtaba Murtazaqon",
  "ILHAM LABIB",
  "Aldo Cahya Putra Permana",
  "Dimas Joko Suyanto",
  "Yoga Adi Pratama",
  "Ahmad Farid Al Fariszi",
  "Yoga Hediasa"
];

async function run() {
  const res = await client.execute("SELECT id_pendaftaran, nama_lengkap FROM pendaftaran WHERE jenis_kelamin IS NULL");
  
  let countL = 0;
  let countP = 0;
  for (const row of res.rows) {
    const isBoy = boys.some(b => row.nama_lengkap.toLowerCase().includes(b.toLowerCase().trim()));
    const jk = isBoy ? 'L' : 'P';
    
    await client.execute({
      sql: "UPDATE pendaftaran SET jenis_kelamin = ? WHERE id_pendaftaran = ?",
      args: [jk, row.id_pendaftaran]
    });
    
    if (jk === 'L') countL++;
    else countP++;
  }
  console.log(`Updated ${countL} Laki-laki and ${countP} Perempuan.`);
}

run().catch(console.error);
