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
      is_verified BOOLEAN DEFAULT FALSE,
      verification_token VARCHAR(128),
      verification_expires TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(128)`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_expires TIMESTAMP`;
}

export { sql };