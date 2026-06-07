import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// เนื่องจากไฟล์นี้จะรันจาก dist/db.js ไฟล์ .env จะอยู่สูงขึ้นไป 1 ระดับที่ root
dotenv.config({ path: join(__dirname, '../.env') });

let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (connectionString) {
      pool = new pg.Pool({ connectionString });
    } else {
      pool = new pg.Pool({
        host: process.env.PGHOST,
        port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : undefined,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
      });
    }
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.error("Database connection pool ended.");
  }
}

export async function query(text: string, params?: any[]) {
  const p = getPool();
  return p.query(text, params);
}
