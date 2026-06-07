import { query } from '../db.js';

export async function executeQuery(sql: string, params?: any[]) {
  console.error(`Executing query: ${sql}`);
  const res = await query(sql, params);
  return {
    command: res.command,
    rowCount: res.rowCount,
    rows: res.rows
  };
}
