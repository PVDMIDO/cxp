const { Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function addAdminUser(username, password) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert admin user
    const query = `
      INSERT INTO users (username, password_hash, role, created_at, updated_at)
      VALUES ($1, $2, 'admin', NOW(), NOW())
      RETURNING id;
    `;
    const res = await client.query(query, [username, passwordHash]);
    console.log('Admin user created with ID:', res.rows[0].id);
  } catch (err) {
    console.error('Error adding admin user:', err);
  } finally {
    await client.end();
  }
}

// Usage: node addAdminUser.js adminUsername adminPassword
const [,, username, password] = process.argv;
if (!username || !password) {
  console.error('Usage: node addAdminUser.js <username> <password>');
  process.exit(1);
}

addAdminUser(username, password);
