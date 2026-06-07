import { query } from '../db.js';

export async function listTables(schema: string = 'public') {
  const sql = `
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = $1 AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `;
  const res = await query(sql, [schema]);
  return res.rows.map(row => row.table_name);
}

export async function describeTable(table: string, schema: string = 'public') {
  const sql = `
    SELECT 
      c.column_name,
      c.data_type,
      c.is_nullable,
      c.column_default,
      (
        SELECT EXISTS (
          SELECT 1 
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          WHERE tc.table_schema = $1 
            AND tc.table_name = $2 
            AND tc.constraint_type = 'PRIMARY KEY'
            AND kcu.column_name = c.column_name
        )
      ) as is_primary_key
    FROM information_schema.columns c
    WHERE c.table_schema = $1 AND c.table_name = $2
    ORDER BY c.ordinal_position;
  `;
  const res = await query(sql, [schema, table]);
  if (res.rows.length === 0) {
    throw new Error(`Table '${schema}.${table}' not found.`);
  }
  return res.rows.map(row => ({
    column: row.column_name,
    type: row.data_type,
    nullable: row.is_nullable === 'YES',
    default: row.column_default,
    primaryKey: row.is_primary_key
  }));
}
