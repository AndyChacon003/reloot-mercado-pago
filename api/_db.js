import bcrypt from 'bcryptjs';
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
      role VARCHAR(20) DEFAULT 'user',
      is_verified BOOLEAN DEFAULT FALSE,
      verification_token VARCHAR(128),
      verification_expires TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(128)`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_expires TIMESTAMP`;

  await sql`
    CREATE TABLE IF NOT EXISTS sell_quotes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      category VARCHAR(80) NOT NULL,
      model VARCHAR(180) NOT NULL,
      expected_price NUMERIC(12, 2) NOT NULL,
      contact VARCHAR(180) NOT NULL,
      image_data TEXT,
      status VARCHAR(30) DEFAULT 'pendiente',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const adminEmail = String(process.env.ADMIN_EMAIL || 'admin@reloot.mx').trim().toLowerCase();
  const adminPassword = String(process.env.ADMIN_PASSWORD || 'AdminReloot2026!');
  const adminName = String(process.env.ADMIN_NAME || 'Admin RELOOT').trim();

  const existingAdmin = await sql`SELECT id FROM users WHERE email = ${adminEmail}`;
  if (existingAdmin.length === 0) {
    const hash = await bcrypt.hash(adminPassword, 10);
    await sql`
      INSERT INTO users (name, email, password_hash, role, is_verified)
      VALUES (${adminName}, ${adminEmail}, ${hash}, 'admin', TRUE)
    `;
  } else {
    await sql`
      UPDATE users
      SET role = 'admin', is_verified = TRUE
      WHERE email = ${adminEmail}
    `;
  }
}

export { sql };