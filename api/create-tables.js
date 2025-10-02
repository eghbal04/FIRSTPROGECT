// Create Tables Manually for Neon Database
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_4dRPEJOfq5Mj@ep-calm-leaf-aehi0krv-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function createTables() {
  try {
    console.log('🔄 Connecting to Neon database...');
    
    const client = await pool.connect();
    console.log('✅ Connected to Neon database');
    
    // Drop existing tables if they exist
    console.log('🔄 Dropping existing tables...');
    await client.query('DROP TABLE IF EXISTS token_prices CASCADE');
    await client.query('DROP TABLE IF EXISTS point_prices CASCADE');
    console.log('✅ Existing tables dropped');
    
    // Create token_prices table
    console.log('🔄 Creating token_prices table...');
    await client.query(`
      CREATE TABLE token_prices (
        id SERIAL PRIMARY KEY,
        symbol VARCHAR(10) NOT NULL,
        name VARCHAR(100) NOT NULL,
        price_usd TEXT NOT NULL,
        price_dai TEXT NOT NULL,
        market_cap TEXT NOT NULL,
        total_supply TEXT NOT NULL,
        decimals INTEGER NOT NULL,
        source VARCHAR(50) DEFAULT 'contract',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ token_prices table created');
    
    // Create point_prices table
    console.log('🔄 Creating point_prices table...');
    await client.query(`
      CREATE TABLE point_prices (
        id SERIAL PRIMARY KEY,
        point_type VARCHAR(50) NOT NULL,
        point_value_usd TEXT NOT NULL,
        point_value_iam TEXT NOT NULL,
        source VARCHAR(50) DEFAULT 'contract',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ point_prices table created');
    
    // Create indexes
    console.log('🔄 Creating indexes...');
    await client.query('CREATE INDEX idx_token_prices_symbol_created ON token_prices(symbol, created_at DESC)');
    await client.query('CREATE INDEX idx_token_prices_created_at ON token_prices(created_at DESC)');
    await client.query('CREATE INDEX idx_point_prices_type_created ON point_prices(point_type, created_at DESC)');
    await client.query('CREATE INDEX idx_point_prices_created_at ON point_prices(created_at DESC)');
    console.log('✅ Indexes created');
    
    // Test insert
    console.log('🔄 Testing inserts...');
    
    const testToken = await client.query(`
      INSERT INTO token_prices (symbol, name, price_usd, price_dai, market_cap, total_supply, decimals, source)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, ['IAM', 'IAM Token', '1.28e-15', '1.28e-15', '1000000', '1000000000', 18, 'test']);
    
    console.log('✅ Test token insert:', testToken.rows[0]);
    
    const testPoint = await client.query(`
      INSERT INTO point_prices (point_type, point_value_usd, point_value_iam, source)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, ['binary_points', '15.63', '0.1', 'test']);
    
    console.log('✅ Test point insert:', testPoint.rows[0]);
    
    // Clean up test data
    await client.query('DELETE FROM token_prices WHERE source = $1', ['test']);
    await client.query('DELETE FROM point_prices WHERE source = $1', ['test']);
    console.log('✅ Test data cleaned up');
    
    // Verify tables
    const tokenColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'token_prices'
      ORDER BY ordinal_position
    `);
    
    const pointColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'point_prices'
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Token prices table columns:');
    tokenColumns.rows.forEach(col => console.log(`  - ${col.column_name}: ${col.data_type}`));
    
    console.log('📊 Point prices table columns:');
    pointColumns.rows.forEach(col => console.log(`  - ${col.column_name}: ${col.data_type}`));
    
    client.release();
    console.log('🎉 Database tables created successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createTables();
