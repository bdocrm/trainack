import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  const client = await pool.connect();

  try {
    console.log('🚀 Starting database migration...');

    // Drop existing tables if they exist
    await client.query(`DROP TABLE IF EXISTS acknowledgments CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS sessions CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS features CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS systems CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS clients CASCADE;`);
    console.log('♻️ Dropped existing tables');

    // Create clients table
    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        company TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created clients table');

    // Create systems table
    await client.query(`
      CREATE TABLE IF NOT EXISTS systems (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        version TEXT NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created systems table');

    // Create features table
    await client.query(`
      CREATE TABLE IF NOT EXISTS features (
        id TEXT PRIMARY KEY,
        "systemId" TEXT NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created features table');

    // Create sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        "clientId" TEXT NOT NULL DEFAULT '',
        title TEXT NOT NULL DEFAULT '',
        "systemId" TEXT NOT NULL REFERENCES systems(id),
        "trainerId" TEXT NOT NULL,
        "sessionDate" DATE NOT NULL,
        location TEXT NOT NULL DEFAULT '',
        "coveredFeatureIds" TEXT NOT NULL DEFAULT '[]',
        notes TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'pending',
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created sessions table');

    // Create acknowledgments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS acknowledgments (
        id TEXT PRIMARY KEY,
        "sessionId" TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        "clientName" TEXT NOT NULL,
        email TEXT NOT NULL DEFAULT '',
        campaign TEXT NOT NULL DEFAULT '',
        position TEXT NOT NULL DEFAULT '',
        "clientSignature" TEXT NOT NULL,
        "acknowledgedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "ipAddress" TEXT,
        "agreeToTerms" INTEGER NOT NULL DEFAULT 0,
        comments TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created acknowledgments table');

    // Create indexes for performance
    await client.query(`CREATE INDEX idx_sessions_system_id ON sessions("systemId");`);
    await client.query(`CREATE INDEX idx_features_system_id ON features("systemId");`);
    await client.query(`CREATE INDEX idx_acknowledgments_session_id ON acknowledgments("sessionId");`);
    console.log('✅ Created indexes');

    console.log('✨ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
