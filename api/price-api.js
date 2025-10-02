// API Server for Neon Database Integration
// این فایل برای سرور Node.js طراحی شده است

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_4dRPEJOfq5Mj@ep-calm-leaf-aehi0krv-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to Neon database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// Save token price (only if different from last record)
app.post('/api/prices/token', async (req, res) => {
  try {
    const { symbol, name, price_usd, price_dai, market_cap, total_supply, decimals, source, timestamp } = req.body;
    
    // Get latest record for comparison
    const latestQuery = `
      SELECT price_usd, price_dai, market_cap, total_supply 
      FROM token_prices 
      WHERE symbol = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    const latestResult = await pool.query(latestQuery, [symbol]);
    
    // Check if values are different
    let shouldInsert = true;
    if (latestResult.rows.length > 0) {
      const latest = latestResult.rows[0];
      const tolerance = 0.0001; // Tolerance for floating point comparison
      
      const priceChanged = Math.abs(parseFloat(price_usd) - parseFloat(latest.price_usd)) > tolerance;
      const daiChanged = Math.abs(parseFloat(price_dai) - parseFloat(latest.price_dai)) > tolerance;
      const marketCapChanged = Math.abs(parseFloat(market_cap) - parseFloat(latest.market_cap)) > tolerance;
      const supplyChanged = Math.abs(parseFloat(total_supply) - parseFloat(latest.total_supply)) > tolerance;
      
      shouldInsert = priceChanged || daiChanged || marketCapChanged || supplyChanged;
      
      if (!shouldInsert) {
        console.log(`📊 Token ${symbol} price unchanged, skipping insert`);
        return res.json({ 
          success: true, 
          skipped: true, 
          message: 'Price unchanged, no new record created',
          lastRecord: latest
        });
      }
    }
    
    // Insert new record
    const query = `
      INSERT INTO token_prices (symbol, name, price_usd, price_dai, market_cap, total_supply, decimals, source, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [symbol, name, price_usd, price_dai, market_cap, total_supply, decimals, source, timestamp || new Date()];
    const result = await pool.query(query, values);
    
    console.log(`✅ New token price record created for ${symbol}`);
    res.json({ success: true, data: result.rows[0], inserted: true });
  } catch (error) {
    console.error('Error saving token price:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save point price (only if different from last record)
app.post('/api/prices/point', async (req, res) => {
  try {
    const { point_type, point_value_usd, point_value_iam, source, timestamp } = req.body;
    
    // Get latest record for comparison
    const latestQuery = `
      SELECT point_value_usd, point_value_iam 
      FROM point_prices 
      WHERE point_type = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    const latestResult = await pool.query(latestQuery, [point_type]);
    
    // Check if values are different
    let shouldInsert = true;
    if (latestResult.rows.length > 0) {
      const latest = latestResult.rows[0];
      const tolerance = 0.0001; // Tolerance for floating point comparison
      
      const usdChanged = Math.abs(parseFloat(point_value_usd) - parseFloat(latest.point_value_usd)) > tolerance;
      const iamChanged = Math.abs(parseFloat(point_value_iam) - parseFloat(latest.point_value_iam)) > tolerance;
      
      shouldInsert = usdChanged || iamChanged;
      
      if (!shouldInsert) {
        console.log(`📊 Point ${point_type} price unchanged, skipping insert`);
        return res.json({ 
          success: true, 
          skipped: true, 
          message: 'Point price unchanged, no new record created',
          lastRecord: latest
        });
      }
    }
    
    // Insert new record
    const query = `
      INSERT INTO point_prices (point_type, point_value_usd, point_value_iam, source, created_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [point_type, point_value_usd, point_value_iam, source, timestamp || new Date()];
    const result = await pool.query(query, values);
    
    console.log(`✅ New point price record created for ${point_type}`);
    res.json({ success: true, data: result.rows[0], inserted: true });
  } catch (error) {
    console.error('Error saving point price:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get latest token price
app.get('/api/prices/token/:symbol/latest', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const query = `
      SELECT * FROM token_prices 
      WHERE symbol = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    const result = await pool.query(query, [symbol]);
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'No token price data found' });
    }
  } catch (error) {
    console.error('Error getting latest token price:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get latest point price
app.get('/api/prices/point/:pointType/latest', async (req, res) => {
  try {
    const { pointType } = req.params;
    
    const query = `
      SELECT * FROM point_prices 
      WHERE point_type = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    const result = await pool.query(query, [pointType]);
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'No point price data found' });
    }
  } catch (error) {
    console.error('Error getting latest point price:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get token price history
app.get('/api/prices/token/:symbol/history', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { hours = 24 } = req.query;
    
    const hoursAgo = new Date(Date.now() - (hours * 60 * 60 * 1000));
    
    const query = `
      SELECT * FROM token_prices 
      WHERE symbol = $1 AND created_at >= $2
      ORDER BY created_at ASC
    `;
    
    const result = await pool.query(query, [symbol, hoursAgo]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting token price history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get point price history
app.get('/api/prices/point/:pointType/history', async (req, res) => {
  try {
    const { pointType } = req.params;
    const { hours = 24 } = req.query;
    
    const hoursAgo = new Date(Date.now() - (hours * 60 * 60 * 1000));
    
    const query = `
      SELECT * FROM point_prices 
      WHERE point_type = $1 AND created_at >= $2
      ORDER BY created_at ASC
    `;
    
    const result = await pool.query(query, [pointType, hoursAgo]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting point price history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get price statistics
app.get('/api/prices/stats', async (req, res) => {
  try {
    const tokenStatsQuery = `
      SELECT 
        symbol,
        COUNT(*) as total_records,
        MIN(created_at) as first_record,
        MAX(created_at) as last_record,
        AVG(price_usd::numeric) as avg_price
      FROM token_prices 
      GROUP BY symbol
    `;
    
    const pointStatsQuery = `
      SELECT 
        point_type,
        COUNT(*) as total_records,
        MIN(created_at) as first_record,
        MAX(created_at) as last_record,
        AVG(point_value_usd::numeric) as avg_price
      FROM point_prices 
      GROUP BY point_type
    `;
    
    const [tokenStats, pointStats] = await Promise.all([
      pool.query(tokenStatsQuery),
      pool.query(pointStatsQuery)
    ]);
    
    res.json({
      tokens: tokenStats.rows,
      points: pointStats.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting price stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cleanup old data (older than 30 days)
app.delete('/api/prices/cleanup', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
    
    const tokenCleanupQuery = 'DELETE FROM token_prices WHERE created_at < $1';
    const pointCleanupQuery = 'DELETE FROM point_prices WHERE created_at < $1';
    
    const [tokenResult, pointResult] = await Promise.all([
      pool.query(tokenCleanupQuery, [thirtyDaysAgo]),
      pool.query(pointCleanupQuery, [thirtyDaysAgo])
    ]);
    
    res.json({
      success: true,
      deleted: {
        token_records: tokenResult.rowCount,
        point_records: pointResult.rowCount
      }
    });
  } catch (error) {
    console.error('Error cleaning up old data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all price data (for debugging)
app.get('/api/prices/all', async (req, res) => {
  try {
    const tokenQuery = 'SELECT * FROM token_prices ORDER BY created_at DESC LIMIT 100';
    const pointQuery = 'SELECT * FROM point_prices ORDER BY created_at DESC LIMIT 100';
    
    const [tokenResult, pointResult] = await Promise.all([
      pool.query(tokenQuery),
      pool.query(pointQuery)
    ]);
    
    res.json({
      tokens: tokenResult.rows,
      points: pointResult.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting all price data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get duplicate prevention statistics
app.get('/api/prices/duplicate-stats', async (req, res) => {
  try {
    const duplicateStatsQuery = `
      SELECT 
        'tokens' as table_name,
        COUNT(*) as total_records,
        COUNT(DISTINCT CONCAT(symbol, '_', price_usd, '_', price_dai)) as unique_combinations,
        ROUND((COUNT(DISTINCT CONCAT(symbol, '_', price_usd, '_', price_dai))::numeric / COUNT(*)) * 100, 2) as uniqueness_percentage
      FROM token_prices
      UNION ALL
      SELECT 
        'points' as table_name,
        COUNT(*) as total_records,
        COUNT(DISTINCT CONCAT(point_type, '_', point_value_usd, '_', point_value_iam)) as unique_combinations,
        ROUND((COUNT(DISTINCT CONCAT(point_type, '_', point_value_usd, '_', point_value_iam))::numeric / COUNT(*)) * 100, 2) as uniqueness_percentage
      FROM point_prices
    `;
    
    const result = await pool.query(duplicateStatsQuery);
    
    res.json({
      success: true,
      data: {
        duplicatePrevention: result.rows,
        summary: {
          totalRecords: result.rows.reduce((sum, row) => sum + parseInt(row.total_records), 0),
          uniqueCombinations: result.rows.reduce((sum, row) => sum + parseInt(row.unique_combinations), 0),
          averageUniqueness: result.rows.reduce((sum, row) => sum + parseFloat(row.uniqueness_percentage), 0) / result.rows.length
        }
      }
    });
  } catch (error) {
    console.error('Error getting duplicate stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Price API server running on port ${port}`);
  console.log(`📊 Database: Neon PostgreSQL`);
  console.log(`🔗 Health check: http://localhost:${port}/api/health`);
});

module.exports = app;
