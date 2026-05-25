import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

dotenv.config();

const db = createClient({
  url: process.env.TURSO_URL as string,
  authToken: process.env.TURSO_API_KEY as string,
});

async function dropColumns() {
  try {
    console.log("Dropping bukti_follow_ig, yt, tiktok from pendaftaran table...");
    await db.execute(`ALTER TABLE pendaftaran DROP COLUMN bukti_follow_ig`);
    await db.execute(`ALTER TABLE pendaftaran DROP COLUMN bukti_follow_yt`);
    await db.execute(`ALTER TABLE pendaftaran DROP COLUMN bukti_follow_tiktok`);
    console.log("Columns dropped successfully.");
  } catch (err) {
    console.error("Error dropping columns:", err);
  }
}

dropColumns();
