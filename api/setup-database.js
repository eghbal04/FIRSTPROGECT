// Setup Database Tables for Neon
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_4dRPEJOfq5Mj@ep-calm-leaf-aehi0krv-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupDatabase() {
  try {
    console.log('🔄 Connecting to Neon database...');
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to Neon database');
    
    // Read SQL schema
    const fs = require('fs');
    const path = require('path');
    const sqlSchema = fs.readFileSync(path.join(__dirname, '../database-schema-neon.sql'), 'utf8');
    
    console.log('🔄 Creating tables...');
    
    // Execute SQL schema
    await client.query(sqlSchema);
    
    console.log('✅ Database tables created successfully');
    
    // Test the tables
    console.log('🔄 Testing tables...');
    
    const tokenTableTest = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'token_prices'
      ORDER BY ordinal_position
    `);
    
    const pointTableTest = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'point_prices'
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Token prices table columns:', tokenTableTest.rows);
    console.log('📊 Point prices table columns:', pointTableTest.rows);
    
    // Test insert
    console.log('🔄 Testing insert...');
    
    const testTokenInsert = await client.query(`
      INSERT INTO token_prices (symbol, name, price_usd, price_dai, market_cap, total_supply, decimals, source)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, ['IAM', 'IAM Token', '1.28e-15', '1.28e-15', '1000000', '1000000000', 18, 'test']);
    
    console.log('✅ Test token insert successful:', testTokenInsert.rows[0]);
    
    const testPointInsert = await client.query(`
      INSERT INTO point_prices (point_type, point_value_usd, point_value_iam, source)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, ['binary_points', '15.63', '0.1', 'test']);
    
    console.log('✅ Test point insert successful:', testPointInsert.rows[0]);
    
    // Clean up test data
    await client.query('DELETE FROM token_prices WHERE source = $1', ['test']);
    await client.query('DELETE FROM point_prices WHERE source = $1', ['test']);
    
    console.log('✅ Test data cleaned up');
    
    client.release();
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
