import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false },
});

pool.on("connect", () => console.log("[DB] Terhubung ke PostgreSQL"));
pool.on("error", (err) => console.error("[DB] Error tak terduga:", err));

export default pool;
