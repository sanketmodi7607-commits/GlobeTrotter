import { Pool } from "pg";

// Next.js hot-reloading can sometimes create multiple connections in development.
// This pattern prevents connection exhaustion.
const globalForPg = global as unknown as { pgPool: Pool };

export const pool = globalForPg.pgPool || new Pool({
  connectionString: process.env.DATABASE_URL,
});

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}

export default pool;