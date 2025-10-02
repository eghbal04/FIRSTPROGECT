const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Clear database
app.post('/api/clear-database', async (req, res) => {
  try {
    console.log('🗑️ Clearing database...');
    
    // Clear token_prices table
    await pool.query('DELETE FROM token_prices');
    console.log('✅ Token prices cleared');
    
    // Clear point_prices table
    await pool.query('DELETE FROM point_prices');
    console.log('✅ Point prices cleared');
    
    res.json({
      success: true,
      message: 'Database cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing database:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get token prices
app.get('/api/token-prices', async (req, res) => {
  try {
    const { symbol, hours = 24 } = req.query;
    
    const query = `
      SELECT * FROM token_prices 
      WHERE symbol = $1 
      AND created_at >= NOW() - INTERVAL '${hours} hours'
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [symbol]);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching token prices:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get point prices
app.get('/api/point-prices', async (req, res) => {
  try {
    const { pointType, hours = 24 } = req.query;
    
    const query = `
      SELECT * FROM point_prices 
      WHERE point_type = $1 
      AND created_at >= NOW() - INTERVAL '${hours} hours'
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [pointType]);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching point prices:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Save token price
app.post('/api/token-prices', async (req, res) => {
  try {
    const { symbol, name, priceUsd, priceDai, marketCap, totalSupply, decimals, source } = req.body;
    
    // Check if we should save (only if different from latest)
    const latestQuery = `
      SELECT price_usd FROM token_prices 
      WHERE symbol = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    const latestResult = await pool.query(latestQuery, [symbol]);
    
    if (latestResult.rows.length > 0) {
      const latestPrice = parseFloat(latestResult.rows[0].price_usd);
      const newPrice = parseFloat(priceUsd);
      
      // مقایسه با دقت 1e-20 برای اعداد بسیار کوچک
      const priceDifference = Math.abs(latestPrice - newPrice);
      const tolerance = Math.max(1e-20, Math.abs(latestPrice) * 0.001); // 0.1% tolerance
      
      if (priceDifference < tolerance) {
        console.log(`📊 Price unchanged for ${symbol}: ${latestPrice} ≈ ${newPrice} (diff: ${priceDifference})`);
        return res.json({
          success: true,
          message: 'Price unchanged, not saved',
          saved: false,
          latestPrice: latestPrice,
          newPrice: newPrice,
          difference: priceDifference
        });
      }
    }
    
    const insertQuery = `
      INSERT INTO token_prices (symbol, name, price_usd, price_dai, market_cap, total_supply, decimals, source)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const result = await pool.query(insertQuery, [
      symbol, name, priceUsd, priceDai, marketCap, totalSupply, decimals, source
    ]);
    
    res.json({
      success: true,
      data: result.rows[0],
      saved: true
    });
  } catch (error) {
    console.error('Error saving token price:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Save point price
app.post('/api/point-prices', async (req, res) => {
  try {
    const { pointType, pointValueUsd, pointValueIam, source } = req.body;
    
    // Check if we should save (only if different from latest)
    const latestQuery = `
      SELECT point_value_usd FROM point_prices 
      WHERE point_type = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    const latestResult = await pool.query(latestQuery, [pointType]);
    
    if (latestResult.rows.length > 0) {
      const latestPrice = parseFloat(latestResult.rows[0].point_value_usd);
      const newPrice = parseFloat(pointValueUsd);
      
      // مقایسه با دقت 0.01 برای قیمت‌های پوینت
      const priceDifference = Math.abs(latestPrice - newPrice);
      const tolerance = 0.01; // $0.01 tolerance
      
      if (priceDifference < tolerance) {
        console.log(`📊 Point price unchanged for ${pointType}: ${latestPrice} ≈ ${newPrice} (diff: ${priceDifference})`);
        return res.json({
          success: true,
          message: 'Price unchanged, not saved',
          saved: false,
          latestPrice: latestPrice,
          newPrice: newPrice,
          difference: priceDifference
        });
      }
    }
    
    const insertQuery = `
      INSERT INTO point_prices (point_type, point_value_usd, point_value_iam, source)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await pool.query(insertQuery, [
      pointType, pointValueUsd, pointValueIam, source
    ]);
    
    res.json({
      success: true,
      data: result.rows[0],
      saved: true
    });
  } catch (error) {
    console.error('Error saving point price:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get latest prices
app.get('/api/latest-prices', async (req, res) => {
  try {
    const tokenQuery = `
      SELECT * FROM token_prices 
      WHERE symbol = 'IAM' 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    const pointQuery = `
      SELECT * FROM point_prices 
      WHERE point_type = 'binary_points' 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    const [tokenResult, pointResult] = await Promise.all([
      pool.query(tokenQuery),
      pool.query(pointQuery)
    ]);
    
    res.json({
      success: true,
      token: tokenResult.rows[0] || null,
      point: pointResult.rows[0] || null
    });
  } catch (error) {
    console.error('Error fetching latest prices:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down API server...');
  pool.end();
  process.exit(0);
});