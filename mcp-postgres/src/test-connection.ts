import { getPool, closePool } from './db.js';

async function test() {
  console.log("Connecting to PostgreSQL...");
  const pool = getPool();
  const res = await pool.query('SELECT NOW()');
  console.log("Success! Server time:", res.rows[0].now);
  await closePool();
}

test().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
