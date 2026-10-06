import { Injectable } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';

@Injectable()
export class PostgresService {
  private readonly pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.PG_HOST || process.env.DB_HOST || 'localhost',
      port: Number(process.env.PG_PORT || process.env.DB_PORT || 5432),
      user: process.env.PG_USER || process.env.DB_USER,
      password: process.env.PG_PASSWORD || process.env.DB_PASS,
      database: process.env.PG_DATABASE || process.env.DB_NAME || 'looloo',
      ssl:
        process.env.PG_SSL === 'true'
          ? { rejectUnauthorized: process.env.PG_SSL_REJECT_UNAUTHORIZED !== 'false' }
          : undefined,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: Number(process.env.PG_CONNECT_TIMEOUT || 15_000),
    });
  }

  async query(sql: string, values: unknown[] = []): Promise<QueryResult['rows']> {
    try {
      const result = await this.pool.query(sql, values);
      return result.rows;
    } catch (error) {
      console.error('PostgreSQL query error:', error);
      throw error;
    }
  }

  private async hasTransactionData(): Promise<boolean> {
    const rows = await this.query(
      `SELECT COUNT(DISTINCT column_name)::int AS matching_columns
       FROM information_schema.columns
       WHERE table_schema = ANY(current_schemas(false))
         AND table_name = 'transactions'
         AND column_name = ANY($1::text[])`,
      [['user_id', 'type', 'amount']],
    );
    return rows[0]?.matching_columns === 3;
  }

  async getUserBalance(userId: number): Promise<any[]> {
    if (await this.hasTransactionData()) {
      return this.query(
        `SELECT u.id, u.username AS name, u.email,
                COALESCE(SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE 0 END), 0) AS total_credited,
                COALESCE(SUM(CASE WHEN t.type = 'debit' THEN t.amount ELSE 0 END), 0) AS total_debited,
                COALESCE(SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE -t.amount END), 0) AS balance,
                TRUE AS balance_available
         FROM users u
         LEFT JOIN transactions t ON u.id = t.user_id
         WHERE u.id = $1
         GROUP BY u.id, u.username, u.email`,
        [userId],
      );
    }

    return this.query(
      `SELECT id, username AS name, email,
              NULL::numeric AS total_credited, NULL::numeric AS total_debited,
              NULL::numeric AS balance, FALSE AS balance_available
       FROM users WHERE id = $1`,
      [userId],
    );
  }

  async getAllUsersBalance(): Promise<any[]> {
    if (await this.hasTransactionData()) {
      return this.query(
        `SELECT u.id, u.username AS name, u.email,
                COALESCE(SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE 0 END), 0) AS total_credited,
                COALESCE(SUM(CASE WHEN t.type = 'debit' THEN t.amount ELSE 0 END), 0) AS total_debited,
                COALESCE(SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE -t.amount END), 0) AS balance,
                TRUE AS balance_available
         FROM users u
         LEFT JOIN transactions t ON u.id = t.user_id
         GROUP BY u.id, u.username, u.email`,
      );
    }

    return this.query(
      `SELECT id, username AS name, email,
              NULL::numeric AS total_credited, NULL::numeric AS total_debited,
              NULL::numeric AS balance, FALSE AS balance_available
       FROM users ORDER BY id`,
    );
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
