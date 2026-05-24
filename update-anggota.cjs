const { createClient } = require('@libsql/client');
const xlsx = require('xlsx');
const path = require('path');
require('dotenv').config();

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_API_KEY,
});

function parseExcelDate(excelDate) {
  if (typeof excelDate === 'number') {
    // Excel dates are number of days since 1900-01-01
    // The fraction is the time. We just want the date.
    const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0];
  }
  return String(excelDate).split(' ')[0];
}

async function run() {
  console.log("Updating no_anggota...");
  await client.execute("UPDATE anggota SET no_anggota = NULL");
  const anggotaRes = await client.execute("SELECT id_anggota FROM anggota ORDER BY id_anggota ASC");
  
  let counter = 1;
  for (const row of anggotaRes.rows) {
    const noAnggota = `RSL-2026-${String(counter).padStart(4, '0')}`;
    await client.execute({
      sql: "UPDATE anggota SET no_anggota = ? WHERE id_anggota = ?",
      args: [noAnggota, row.id_anggota]
    });
    counter++;
  }
  console.log(`Updated no_anggota for ${counter - 1} members.`);

  console.log("Updating tgl_pendaftaran from Excel...");
  const filePath = path.join(__dirname, '..', 'Pendaftaran Orditas 25 (Responses).xlsx');
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);

  let updatedDates = 0;
  for (const row of data) {
    const email = row['Email'];
    const timestamp = row['Timestamp'];
    
    if (email && timestamp) {
      const dateOnly = parseExcelDate(timestamp);
      
      try {
        await client.execute({
          sql: "UPDATE pendaftaran SET tgl_pendaftaran = ? WHERE email = ?",
          args: [dateOnly, email]
        });
        updatedDates++;
      } catch(e) {
        console.error("Failed to update for", email, e);
      }
    }
  }
  console.log(`Updated tgl_pendaftaran for ${updatedDates} records.`);
}

run().catch(console.error);
