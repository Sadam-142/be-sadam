import { createClient } from "@libsql/client";
import { env } from "../config/env";

const client = createClient({
  url: env.TURSO_URL,
  authToken: env.TURSO_API_KEY,
});

export default client;