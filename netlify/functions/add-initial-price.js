exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    // تاریخ 30 روز پیش
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // قیمت اولیه توکن
    const initialTokenPrice = {
      id: 0,
      symbol: 'IAM',
      name: 'IAM Token',
      priceUsd: '1e-15',
      priceDai: '1e-15',
      marketCap: '1000000000', // 1 billion tokens
      totalSupply: '1000000000',
      decimals: 18,
      source: 'initial',
      createdAt: thirtyDaysAgo.toISOString()
    };
    
    // قیمت اولیه پوینت‌ها
    const initialPointPrices = [
      {
        id: 0,
        pointType: 'binary_points',
        pointValueUsd: '0.01',
        pointValueIam: '10000000000000000', // 0.01 IAM
        source: 'initial',
        createdAt: thirtyDaysAgo.toISOString()
      },
      {
        id: 0,
        pointType: 'referral_points',
        pointValueUsd: '0.01',
        pointValueIam: '10000000000000000',
        source: 'initial',
        createdAt: thirtyDaysAgo.toISOString()
      },
      {
        id: 0,
        pointType: 'monthly_points',
        pointValueUsd: '0.01',
        pointValueIam: '10000000000000000',
        source: 'initial',
        createdAt: thirtyDaysAgo.toISOString()
      }
    ];
    
    console.log('✅ Initial prices prepared successfully');
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Initial prices prepared successfully',
        data: {
          tokenPrice: initialTokenPrice,
          pointPrices: initialPointPrices
        }
      })
    };
    
  } catch (error) {
    console.error('❌ Error preparing initial prices:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};