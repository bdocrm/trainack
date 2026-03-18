import { Pool, QueryResult } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
});

// Simple wrapper for backward compatibility with SQLite API
class Database {
  // Convert Date objects in rows to ISO strings for JSON serialization
  private serializeRow(row: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
    if (!row) return undefined;
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      result[key] = value instanceof Date ? value.toISOString() : value;
    }
    return result;
  }

  async query(text: string, params?: unknown[]): Promise<QueryResult> {
    try {
      const res = await pool.query(text, params);
      return res;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // Prepare and execute similar to better-sqlite3
  prepare(sql: string) {
    return {
      run: (...params: unknown[]) => {
        return pool.query(sql, params);
      },
      get: async (...params: unknown[]) => {
        const res = await pool.query(sql, params);
        return this.serializeRow(res.rows[0] as Record<string, unknown> | undefined);
      },
      all: async (...params: unknown[]) => {
        const res = await pool.query(sql, params);
        return res.rows.map(row => this.serializeRow(row as Record<string, unknown>));
      },
    };
  }

  exec(sql: string) {
    return pool.query(sql);
  }
}

const db = new Database();

export default db;
