const xlsx = require('xlsx');
const path = require('path');
const bcrypt = require('bcryptjs');
const { createClient } = require('@libsql/client');
require('dotenv').config();

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_API_KEY,
});

function parseExcelDate(excelDate) {
  if (typeof excelDate === 'number') {
    // Excel dates are number of days since 1900-01-01
    const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0];
  }
  return String(excelDate);
}

const now = () => new Date().toISOString().replace("T", " ").slice(0, 19);

async function run() {
  const filePath = path.join(__dirname, '..', 'Pendaftaran Orditas 25 (Responses).xlsx');
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);

  console.log(`Found ${data.length} records. Starting import...`);

  let count = 0;
  for (const row of data) {
    try {
      const email = row['Email'];
      const nama_lengkap = row['Nama Lengkap'];
      const nim = String(row['NIM'] || '');
      const tempat_lahir = row['Tempat Lahir'];
      const tanggal_lahir = row['Tanggal Lahir'] ? parseExcelDate(row['Tanggal Lahir']) : null;
      const alamat_domisili = row['Alamat Domisili'];
      const program_studi = row['Program Studi'];
      const bidang_minat = row['Bidang yang diminati'];
      const no_hp = String(row['Nomor WhatsApp'] || '');
      const nama_akun_ig = row['Instagram'];
      const angkatan = '2025';

      // Insert into pendaftaran
      const res = await client.execute({
        sql: `INSERT INTO pendaftaran 
              (nama_lengkap, nim, email, angkatan, program_studi, no_hp, 
               bidang_minat, tempat_lahir, tanggal_lahir, alamat_domisili, 
               nama_akun_ig, status_pendaftaran, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'diterima', ?, ?)
              RETURNING id_pendaftaran`,
        args: [
          nama_lengkap || 'Tanpa Nama',
          nim,
          email || null,
          angkatan,
          program_studi || null,
          no_hp,
          bidang_minat || null,
          tempat_lahir || null,
          tanggal_lahir,
          alamat_domisili || null,
          nama_akun_ig || null,
          now(),
          now()
        ]
      });

      const idPendaftaran = res.rows[0].id_pendaftaran;
      
      // Create Anggota account
      const username = nim || `user_${Date.now()}`;
      const password = await bcrypt.hash(nim || 'risalah2025', 10);
      
      await client.execute({
        sql: `INSERT INTO anggota 
              (id_pendaftaran, username, password, role, status_anggota, created_at, updated_at)
              VALUES (?, ?, ?, 'user', 'aktif', ?, ?)`,
        args: [
          idPendaftaran,
          username,
          password,
          now(),
          now()
        ]
      });

      count++;
      console.log(`Inserted: ${nama_lengkap} (${username})`);
    } catch (err) {
      console.error(`Failed to insert row: ${row['Nama Lengkap']}`, err);
    }
  }

  console.log(`Import finished! Successfully imported ${count} records.`);
}

run().catch(console.error);
