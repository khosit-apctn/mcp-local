import format from 'pg-format';
import { Filter } from '../types.js';
import { query } from '../db.js';

export function buildWhereClause(filters: Filter[] | undefined, paramOffset: number = 1): { sql: string; values: any[] } {
  if (!filters || filters.length === 0) {
    return { sql: '', values: [] };
  }

  const clauses: string[] = [];
  const values: any[] = [];
  let currentParamIndex = paramOffset;

  for (const filter of filters) {
    const colIdent = format.ident(filter.column);
    const op = filter.operator;

    if (op === 'IS' || op === 'IS NOT') {
      const valStr = filter.value === null || String(filter.value).toUpperCase() === 'NULL' ? 'NULL' : String(filter.value);
      if (valStr !== 'NULL') {
        throw new Error(`Operator ${op} can only be used with NULL value`);
      }
      clauses.push(`${colIdent} ${op} NULL`);
    } else if (op === 'IN') {
      if (!Array.isArray(filter.value)) {
        throw new Error(`Operator IN requires an array value`);
      }
      clauses.push(`${colIdent} = ANY($${currentParamIndex})`);
      values.push(filter.value);
      currentParamIndex++;
    } else {
      clauses.push(`${colIdent} ${op} $${currentParamIndex}`);
      values.push(filter.value);
      currentParamIndex++;
    }
  }

  return {
    sql: `WHERE ${clauses.join(' AND ')}`,
    values
  };
}

export async function selectRows(options: {
  table: string;
  schema?: string;
  columns?: string[];
  filters?: Filter[];
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
}) {
  const schema = options.schema || 'public';
  const tableIdent = format.ident(schema) + '.' + format.ident(options.table);

  const colsStr = options.columns && options.columns.length > 0
    ? options.columns.map(c => format.ident(c)).join(', ')
    : '*';

  const { sql: whereSql, values } = buildWhereClause(options.filters, 1);

  let sql = `SELECT ${colsStr} FROM ${tableIdent} ${whereSql}`;

  if (options.orderBy) {
    sql += ` ORDER BY ${format.ident(options.orderBy)}`;
    if (options.orderDirection === 'DESC') {
      sql += ' DESC';
    } else {
      sql += ' ASC';
    }
  }

  if (options.limit !== undefined) {
    sql += ` LIMIT ${Number(options.limit)}`;
  }
  if (options.offset !== undefined) {
    sql += ` OFFSET ${Number(options.offset)}`;
  }

  const res = await query(sql, values);
  return res.rows;
}

export async function insertRow(table: string, data: Record<string, any>, schema: string = 'public') {
  const tableIdent = format.ident(schema) + '.' + format.ident(table);
  const keys = Object.keys(data);
  if (keys.length === 0) {
    throw new Error("Cannot insert empty object");
  }

  const cols = keys.map(k => format.ident(k)).join(', ');
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const values = keys.map(k => data[k]);

  const sql = `INSERT INTO ${tableIdent} (${cols}) VALUES (${placeholders}) RETURNING *`;
  const res = await query(sql, values);
  return res.rows[0];
}

export async function updateRows(table: string, data: Record<string, any>, filters: Filter[], schema: string = 'public') {
  const tableIdent = format.ident(schema) + '.' + format.ident(table);
  const setKeys = Object.keys(data);
  if (setKeys.length === 0) {
    throw new Error("No properties to update");
  }

  const setClauses: string[] = [];
  const setValues: any[] = [];
  let pIndex = 1;

  for (const key of setKeys) {
    setClauses.push(`${format.ident(key)} = $${pIndex}`);
    setValues.push(data[key]);
    pIndex++;
  }

  const { sql: whereSql, values: whereValues } = buildWhereClause(filters, pIndex);
  const combinedValues = [...setValues, ...whereValues];

  const sql = `UPDATE ${tableIdent} SET ${setClauses.join(', ')} ${whereSql} RETURNING *`;
  const res = await query(sql, combinedValues);
  return {
    rowCount: res.rowCount,
    rows: res.rows
  };
}

export async function deleteRows(table: string, filters: Filter[], schema: string = 'public') {
  const tableIdent = format.ident(schema) + '.' + format.ident(table);
  if (!filters || filters.length === 0) {
    throw new Error("Deleting all rows is disallowed in simple CRUD tool. Use execute_query if needed.");
  }

  const { sql: whereSql, values } = buildWhereClause(filters, 1);

  const sql = `DELETE FROM ${tableIdent} ${whereSql} RETURNING *`;
  const res = await query(sql, values);
  return {
    rowCount: res.rowCount,
    rows: res.rows
  };
}
