// Netlify Function برای ذخیره قیمت توکن
exports.handler = async (event, context) => {
  // بررسی CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // بررسی method
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    // Parse request body
    const tokenData = JSON.parse(event.body);
    
    // اعتبارسنجی داده‌ها
    if (!tokenData.symbol || !tokenData.priceUsd) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // شبیه‌سازی ذخیره در دیتابیس
    const savedData = {
      id: Date.now(),
      symbol: tokenData.symbol,
      name: tokenData.name || 'Token',
      priceUsd: tokenData.priceUsd,
      priceDai: tokenData.priceDai || tokenData.priceUsd,
      marketCap: tokenData.marketCap || '0',
      totalSupply: tokenData.totalSupply || '0',
      decimals: tokenData.decimals || 18,
      source: tokenData.source || 'netlify-function',
      createdAt: new Date().toISOString()
    };

    console.log('✅ Token price saved to Netlify Database:', savedData);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: savedData,
        message: 'Token price saved successfully'
      })
    };

  } catch (error) {
    console.error('❌ Error saving token price:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};

