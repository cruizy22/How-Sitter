import pool from './config/database.js';

async function testDatabase() {
  try {
    // Test 1: Check if tables exist
    console.log('📊 Testing database connection...');

    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('✅ Connected to database');
    console.log('\n📋 Tables in database:');
    tables.rows.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });

    // Test 2: Check users table
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`\n👥 Users in database: ${userCount.rows[0].count}`);

    // Test 3: Check if admin user exists
    const admin = await pool.query(`
      SELECT id, email, name, role
      FROM users
      WHERE role = 'admin'
    `);

    if (admin.rows.length > 0) {
      console.log('✅ Admin user exists');
    } else {
      console.log('⚠️ No admin user found');
    }

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    await pool.end();
  }
}

testDatabase();