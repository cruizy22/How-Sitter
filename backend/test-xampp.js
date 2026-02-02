import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testXAMPP() {
  console.log('🧪 Testing XAMPP MySQL Connection...\n');
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'howsitter'
  };
  
  console.log('Using config:', { ...config, password: config.password ? '***' : '(empty)' });
  
  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected to MySQL!');
    
    // List databases
    const [dbs] = await connection.execute('SHOW DATABASES');
    console.log('\n📂 Available databases:');
    dbs.forEach(db => console.log('  -', db.Database));
    
    // Check if our database exists
    const hasDB = dbs.some(db => db.Database === config.database);
    console.log(`\n🔍 Database "${config.database}": ${hasDB ? '✅ Found' : '❌ Not found'}`);
    
    if (hasDB) {
      // List tables
      const [tables] = await connection.execute(`SHOW TABLES FROM \`${config.database}\``);
      console.log('\n📊 Tables in database:');
      tables.forEach(table => {
        const tableName = table[`Tables_in_${config.database}`];
        console.log('  -', tableName);
      });
      
      // Count records
      const tableList = ['users', 'properties', 'sitters'];
      for (const table of tableList) {
        try {
          const [count] = await connection.execute(`SELECT COUNT(*) as count FROM \`${config.database}\`.\`${table}\``);
          console.log(`  📈 ${table}: ${count[0].count} records`);
        } catch (e) {
          console.log(`  📈 ${table}: Table doesn't exist yet`);
        }
      }
    }
    
    await connection.end();
    console.log('\n🎉 XAMPP MySQL is working perfectly!');
    
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Open XAMPP Control Panel');
    console.log('2. Make sure MySQL is running (green "Start" button)');
    console.log('3. Check phpMyAdmin: http://localhost/phpmyadmin');
    console.log('4. Verify database "howsitter" exists');
    console.log('5. Ensure .env file has empty password: DB_PASSWORD=');
  }
}

testXAMPP();