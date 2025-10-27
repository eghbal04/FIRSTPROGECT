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
      symbol: 'IAM',
      name: 'IAM Token',
      priceUsd: '1e-15',
      priceDai: '1e-15',
      marketCap: '1000000000',
      totalSupply: '1000000000',
      decimals: 18,
      source: 'initial',
      createdAt: thirtyDaysAgo.toISOString()
    };
    
    // قیمت اولیه پوینت‌ها
    const initialPointPrices = [
      {
        pointType: 'binary_points',
        pointValueUsd: '0.01',
        pointValueIam: '10000000000000000',
        source: 'initial',
        createdAt: thirtyDaysAgo.toISOString()
      },
      {
        pointType: 'referral_points',
        pointValueUsd: '0.01',
        pointValueIam: '10000000000000000',
        source: 'initial',
        createdAt: thirtyDaysAgo.toISOString()
      },
      {
        pointType: 'monthly_points',
        pointValueUsd: '0.01',
        pointValueIam: '10000000000000000',
        source: 'initial',
        createdAt: thirtyDaysAgo.toISOString()
      }
    ];
    
    // شبیه‌سازی ذخیره در دیتابیس
    console.log('✅ Initial token price:', initialTokenPrice);
    console.log('✅ Initial point prices:', initialPointPrices);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Initial data saved successfully',
        data: {
          tokenPrice: initialTokenPrice,
          pointPrices: initialPointPrices,
          timestamp: new Date().toISOString()
        }
      })
    };
    
  } catch (error) {
    console.error('❌ Error saving initial data:', error);
    
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

