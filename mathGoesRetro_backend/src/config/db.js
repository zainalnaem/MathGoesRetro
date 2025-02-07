const { Pool } = require('pg');

// Directly using the database connection parameters
const pool = new Pool({
  host: 'aws-0-eu-central-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.mmvbdnlwvgougsejhxtj',
  password: 'sypteamth2024',
});

// Test the connection
pool.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch((err) => console.error('Connection error:', err));

module.exports = pool;