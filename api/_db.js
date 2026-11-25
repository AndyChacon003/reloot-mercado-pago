import { neon } from '@neondatabase/serverless';

const DEFAULT_DB_URL =
    'postgresql://neondb_owner:npg_dxcI6mn8fqZh@ep-shiny-dawn-be73jv99-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sql = neon(process.env.DATABASE_URL || DEFAULT_DB_URL);

export async function ensureTables() {
    await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(160) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

export { sql };