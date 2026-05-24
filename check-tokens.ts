import { createClient } from "@libsql/client";
import { env } from "./src/config/env";

const db = createClient({
  url: env.TURSO_URL,
  authToken: env.TURSO_API_KEY,
});

async function run() {
  const result = await db.execute("SELECT id_anggota, username, device_token FROM anggota WHERE device_token IS NOT NULL");
  console.log("Users with device token:");
  console.log(result.rows);
}

run().catch(console.error);
