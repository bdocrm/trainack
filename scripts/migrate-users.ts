import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrateUsers() {
  const client = await pool.connect();
  try {
    console.log('🚀 Creating users table...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        "displayName" TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        status TEXT NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created users table');

    // Check if any users exist
    const { rows } = await client.query('SELECT COUNT(*) as count FROM users');
    if (Number(rows[0].count) === 0) {
      const id = uuidv4();
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await client.query(
        'INSERT INTO users (id, username, password, "displayName", role) VALUES ($1, $2, $3, $4, $5)',
        [id, 'admin', hashedPassword, 'Administrator', 'admin']
      );
      console.log('✅ Created default admin user (username: admin, password: admin123)');
    } else {
      console.log('ℹ️  Users already exist, skipping seed');
    }

    console.log('✨ Users migration completed!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrateUsers();
