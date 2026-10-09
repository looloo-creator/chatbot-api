import { Injectable } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';

@Injectable()
export class PostgresService {
  private readonly pool: Pool;
  private knowledgeStoreAvailable?: boolean;

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

  async getUserBalance(userId: number): Promise<any[]> {
    return this.query(
      `SELECT COALESCE(SUM(amount) FILTER (WHERE type = 'collection'), 0) AS collection_total,
              COALESCE(SUM(amount) FILTER (WHERE type <> 'collection'), 0) AS expenditure_total,
              COALESCE(SUM(CASE WHEN type = 'collection' THEN amount ELSE -amount END), 0) AS balance
       FROM accounts WHERE user_id = $1 AND status = TRUE`,
      [userId],
    );
  }

  getTourPaymentStatus(tourId: string, userId: number): Promise<any[]> {
    return this.query(
      `SELECT t.id AS _id, t.plan, t.description, t.plan_start_date, t.plan_end_date,
              COALESCE(SUM(a.amount) FILTER (WHERE a.type = 'collection'), 0) AS collection_total,
              COALESCE(SUM(a.amount) FILTER (WHERE a.type <> 'collection'), 0) AS expenditure_total,
              COALESCE(SUM(CASE WHEN a.type = 'collection' THEN a.amount ELSE -a.amount END), 0) AS balance,
              COALESCE(json_agg(json_build_object('type', a.type, 'amount', a.amount, 'date', a.date, 'reason', a.reason, 'members', a.members, 'collected_from', a.collected_from)) FILTER (WHERE a.id IS NOT NULL), '[]'::json) AS accounts
       FROM tours t LEFT JOIN accounts a ON a.tour_id = t.id AND a.user_id = t.user_id AND a.status = TRUE
       WHERE t.id = $1 AND t.user_id = $2 AND t.status = TRUE
       GROUP BY t.id`, [tourId, userId],
    );
  }

  getMyTours(userId: number): Promise<any[]> {
    return this.query(
      `SELECT id AS _id, plan, description, plan_start_date, plan_end_date FROM tours WHERE user_id = $1 AND status = TRUE ORDER BY plan_start_date`,
      [userId],
    );
  }

  getMemberBalance(memberId: string, userId: number): Promise<any[]> {
    return this.query(
      `SELECT m.id AS _id, m.tour_id, m.name,
              COALESCE(SUM(CASE WHEN a.type = 'collection' THEN a.amount / NULLIF(jsonb_array_length(a.members), 0) ELSE 0 END), 0) AS collection_total,
              COALESCE(SUM(CASE WHEN a.type <> 'collection' THEN a.amount / NULLIF(jsonb_array_length(a.members), 0) ELSE 0 END), 0) AS expenditure_total,
              COALESCE(SUM(CASE WHEN a.type = 'collection' THEN a.amount / NULLIF(jsonb_array_length(a.members), 0) ELSE -a.amount / NULLIF(jsonb_array_length(a.members), 0) END), 0) AS balance,
              COALESCE(json_agg(json_build_object('type', a.type, 'amount', a.amount / NULLIF(jsonb_array_length(a.members), 0), 'date', a.date, 'reason', a.reason)) FILTER (WHERE a.id IS NOT NULL), '[]'::json) AS accounts
       FROM tour_members m LEFT JOIN accounts a ON a.user_id = m.user_id AND a.tour_id = m.tour_id AND a.status = TRUE AND a.members @> jsonb_build_array(m.id)
       WHERE m.id = $1 AND m.user_id = $2 AND m.status = TRUE GROUP BY m.id`, [memberId, userId],
    );
  }

  getAccount(accountId: string, userId: number): Promise<any[]> {
    return this.query(
      `SELECT id AS _id, tour_id, type, date, collected_from, amount, reason, members, fileName
       FROM accounts WHERE id = $1 AND user_id = $2 AND status = TRUE`, [accountId, userId],
    );
  }

  getMembersWithBalance(userId: number): Promise<any[]> {
    return this.query(
      `SELECT id AS _id, tour_id, name FROM tour_members WHERE user_id = $1 AND status = TRUE ORDER BY name`, [userId],
    );
  }

  searchMembersByName(name: string, userId: number): Promise<any[]> {
    return this.query(
      `SELECT id AS _id, tour_id, name FROM tour_members WHERE user_id = $1 AND status = TRUE AND name ILIKE $2 ORDER BY name LIMIT 20`,
      [userId, `%${name}%`],
    );
  }

  searchKnowledge(embedding: number[], userId: number): Promise<any[]> {
    const vector = `[${embedding.join(',')}]`;
    return this.query(
      `SELECT content, metadata, 1 - (embedding <=> $1::vector) AS similarity
       FROM assistant_knowledge WHERE owner_user_id = $2 OR owner_user_id IS NULL
       ORDER BY embedding <=> $1::vector LIMIT 5`, [vector, userId],
    );
  }

  async saveKnowledge(content: string, metadata: Record<string, unknown>, embedding: number[], userId: number): Promise<void> {
    const vector = `[${embedding.join(',')}]`;
    await this.query(
      `INSERT INTO assistant_knowledge (owner_user_id, content, metadata, embedding)
       VALUES ($1, $2, $3::jsonb, $4::vector)`, [userId, content, JSON.stringify(metadata), vector],
    );
  }

  async hasKnowledgeStore(): Promise<boolean> {
    if (this.knowledgeStoreAvailable !== undefined) return this.knowledgeStoreAvailable;
    const rows = await this.query(
      `SELECT to_regclass('assistant_knowledge') IS NOT NULL AS table_exists,
              EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') AS vector_exists`,
    );
    const available = Boolean(rows[0]?.table_exists && rows[0]?.vector_exists);
    if (available) this.knowledgeStoreAvailable = true;
    return available;
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
