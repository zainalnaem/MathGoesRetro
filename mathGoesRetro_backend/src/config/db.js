/**
 * Name: MathGoesRetro
 * Author: Zain Aldin Zaher Alnaem
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */
/**
 * Sets up a PostgreSQL database connection using the pg library. 
 * The connection is configured with specific host, port, database, user, and password details.
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load database configuration from dbConfig.json
const configPath = path.join(__dirname, 'dbConfig.json');
let dbConfig;

try {
  const configData = fs.readFileSync(configPath, 'utf-8');
  dbConfig = JSON.parse(configData);
  console.log('Using database configuration from dbConfig.json');
} catch (error) {
  console.error('Error loading dbConfig.json:', error.message);
  process.exit(1); // Stop execution if config can't be loaded
}

// Initialize PostgreSQL pool
const pool = new Pool(dbConfig);

// Test the connection
pool.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch((err) => console.error('Connection error:', err));

module.exports = pool;