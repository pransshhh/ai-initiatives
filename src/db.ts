import { Pool } from "pg";
import { env } from "./env.js";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 3,
  connectionTimeoutMillis: 5000,
});

export default pool