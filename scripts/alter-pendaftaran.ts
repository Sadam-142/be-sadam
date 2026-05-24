import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

dotenv.config();

const client = createClient({
  url: process.env.TURSO_URL as string,
  authToken: process.env.TURSO_API_KEY as string,
});

async function runAlter() {
  console.log("Starting ALTER TABLE pendaftaran...");
  const columns = [
    "alamat_domisili TEXT",
    "fakultas TEXT",
    "nama_akun_ig TEXT",
    "bukti_follow_ig TEXT",
    "bukti_follow_yt TEXT",
    "bukti_follow_tiktok TEXT"
  ];

  for (const col of columns) {
    try {
      console.log(`Adding column: ${col}`);
      await client.execute(`ALTER TABLE pendaftaran ADD COLUMN ${col}`);
      console.log(`Success adding ${col}`);
    } catch (err: any) {
      if (err.message && err.message.includes("duplicate column name")) {
        console.log(`Column ${col} already exists, skipping.`);
      } else {
        console.error(`Failed to add ${col}:`, err);
      }
    }
  }
  console.log("ALTER TABLE finished.");
}

runAlter().catch(console.error);
