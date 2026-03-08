// backend/test-db.js
import { neon } from '@netlify/neon';

async function testConnection() {
  try {
    const sql = neon();
    
    // Test query
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Database connected!', result);
    
    // Check if your tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('📊 Tables in database:', tables);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

testConnection();