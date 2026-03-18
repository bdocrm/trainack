import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  const client = await pool.connect();

  try {
    console.log('🌱 Starting database seed...');

    // Seed clients
    const clientId1 = uuidv4();
    const clientId2 = uuidv4();
    
    await client.query(
      'INSERT INTO clients (id, name, company, email, phone, address, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [clientId1, 'John Dela Cruz', 'ABC Corporation', 'john@abccorp.com', '+63 912 345 6789', 'Pasig City, Metro Manila', 'active']
    );
    
    await client.query(
      'INSERT INTO clients (id, name, company, email, phone, address, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [clientId2, 'Maria Santos', 'XYZ Enterprises', 'maria@xyzent.com', '+63 917 654 3210', 'Makati City, Metro Manila', 'active']
    );
    console.log('✅ Seeded clients');

    // Seed system
    const systemId = uuidv4();
    await client.query(
      'INSERT INTO systems (id, name, description, version) VALUES ($1, $2, $3, $4)',
      [systemId, 'POS Point-of-Sale System', 'Complete point-of-sale system for retail and restaurant environments.', 'v2.1']
    );
    console.log('✅ Seeded systems');

    // Seed features
    const features = [
      { title: 'User Login & Authentication', description: 'Covers how to log in, reset passwords, and manage user roles and permissions.', category: 'Core' },
      { title: 'Sales Transaction Processing', description: 'How to input sales, apply discounts, handle returns, and print receipts.', category: 'Core' },
      { title: 'Inventory Management', description: 'Track stock levels, receive new inventory, and set reorder alerts.', category: 'Admin' },
      { title: 'Daily Sales Report', description: 'Generate end-of-day reports showing total sales, voids, and discounts.', category: 'Reports' },
      { title: 'System Settings & Configuration', description: 'Configure store info, tax rates, receipt templates, and printer settings.', category: 'Settings' },
    ];

    const featureIds: string[] = [];
    for (const f of features) {
      const fId = uuidv4();
      featureIds.push(fId);
      await client.query(
        'INSERT INTO features (id, "systemId", title, description, category, "sortOrder") VALUES ($1, $2, $3, $4, $5, $6)',
        [fId, systemId, f.title, f.description, f.category, features.indexOf(f)]
      );
    }
    console.log('✅ Seeded features');

    // Seed session
    const sessionId = uuidv4();
    const now = new Date();
    await client.query(
      'INSERT INTO sessions (id, "clientId", title, "systemId", "trainerId", "sessionDate", location, "coveredFeatureIds", notes, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
      [
        sessionId,
        '',
        'POS System Training – Initial Walkthrough',
        systemId,
        'Trainer Admin',
        now.toISOString().split('T')[0],
        'On-site, Pasig City',
        JSON.stringify(featureIds),
        'Initial system walkthrough and training.',
        'pending'
      ]
    );
    console.log('✅ Seeded sessions');

    console.log('✨ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
