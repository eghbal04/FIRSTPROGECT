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
    console.log('Starting price calculation...');
    
    // محاسبه قیمت امروز بر اساس رشد 31.5% در 30 روز
    const basePrice = 1e-15;
    const totalGrowth = 0.315; // 31.5% رشد کل در 30 روز
    
    // قیمت امروز (31.5% رشد از قیمت اولیه)
    const todayPrice = basePrice * (1 + totalGrowth);
    const todayMarketCap = todayPrice * 1000000000;
    
    console.log('Base price:', basePrice);
    console.log('Today price:', todayPrice);
    console.log('Growth:', totalGrowth * 100 + '%');
    console.log('Market cap:', todayMarketCap);
    
    // قیمت امروز توکن
    const todayTokenPrice = {
      id: 31,
      symbol: 'IAM',
      name: 'IAM Token',
      priceUsd: todayPrice.toExponential(6),
      priceDai: todayPrice.toExponential(6),
      marketCap: todayMarketCap.toFixed(2),
      totalSupply: '1000000000',
      decimals: 18,
      source: 'blockchain',
      createdAt: new Date().toISOString()
    };
    
    // قیمت امروز پوینت‌ها (فقط قیمت فعلی، بدون تاریخچه)
    const todayPointValue = 0.01; // قیمت فعلی پوینت
    const todayPointValueIam = 10000000000000000; // مقدار ثابت برای سادگی
    
    console.log('Point value USD:', todayPointValue);
    console.log('Point value IAM:', todayPointValueIam);
    
    const todayPointPrices = [
      {
        id: 31,
        pointType: 'binary_points',
        pointValueUsd: todayPointValue.toFixed(2),
        pointValueIam: todayPointValueIam.toString(),
        source: 'blockchain',
        createdAt: new Date().toISOString()
      },
      {
        id: 32,
        pointType: 'referral_points',
        pointValueUsd: todayPointValue.toFixed(2),
        pointValueIam: todayPointValueIam.toString(),
        source: 'blockchain',
        createdAt: new Date().toISOString()
      },
      {
        id: 33,
        pointType: 'monthly_points',
        pointValueUsd: todayPointValue.toFixed(2),
        pointValueIam: todayPointValueIam.toString(),
        source: 'blockchain',
        createdAt: new Date().toISOString()
      }
    ];
    
    console.log('✅ Today\'s prices calculated successfully');
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Today\'s prices calculated successfully',
        data: {
          tokenPrice: todayTokenPrice,
          pointPrices: todayPointPrices,
          growth: {
            tokenGrowth: (totalGrowth * 100).toFixed(2) + '%',
            pointGrowth: '0% (current price only)',
            daysPassed: 30
          }
        }
      })
    };
    
  } catch (error) {
    console.error('❌ Error calculating today\'s prices:', error);
    
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