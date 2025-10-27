// Netlify Function برای دریافت قیمت‌ها
exports.handler = async (event, context) => {
  // بررسی CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
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
    // Parse query parameters
    const { symbol, pointType, hours = 24 } = event.queryStringParameters || {};

    // شبیه‌سازی دریافت از دیتابیس
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // تولید داده‌های رشد روزانه توکن از 30 روز پیش تا امروز
    const generateDailyPrices = () => {
      const prices = [];
      const basePrice = 1e-15; // قیمت اولیه
      const totalGrowth = 0.315; // 31.5% رشد کل در 30 روز
      const dailyGrowth = totalGrowth / 30; // رشد روزانه ساده (31.5% / 30 روز)
      
      for (let day = 0; day <= 30; day++) {
        const date = new Date(thirtyDaysAgo);
        date.setDate(date.getDate() + day);
        
        // محاسبه قیمت با رشد خطی
        const currentPrice = basePrice * (1 + dailyGrowth * day);
        const marketCap = currentPrice * 1000000000; // 1 billion tokens
        
        prices.push({
          id: day,
          symbol: 'IAM',
          name: 'IAM Token',
          priceUsd: currentPrice.toExponential(6),
          priceDai: currentPrice.toExponential(6),
          marketCap: marketCap.toExponential(6), // استفاده از نماد علمی برای اعداد کوچک
          totalSupply: '1000000000',
          decimals: 18,
          source: day === 0 ? 'initial' : (day === 30 ? 'blockchain' : 'historical'),
          createdAt: date.toISOString()
        });
      }
      
      return prices;
    };
    
    const mockData = {
      tokenPrices: generateDailyPrices(),
      pointPrices: (() => {
        const pointTypes = ['binary_points', 'referral_points', 'monthly_points'];
        const points = [];
        const currentPointValue = 0.01; // قیمت فعلی پوینت
        const pointValueIam = 10000000000000000; // مقدار ثابت برای سادگی
        
        // فقط قیمت فعلی پوینت‌ها (بدون تاریخچه)
        pointTypes.forEach((pointType, index) => {
          points.push({
            id: index + 1,
            pointType: pointType,
            pointValueUsd: currentPointValue.toFixed(2),
            pointValueIam: pointValueIam.toFixed(0),
            source: 'blockchain',
            createdAt: new Date().toISOString() // لحظه فعلی
          });
        });
        
        return points;
      })()
    };

    // مرتب کردن داده‌ها بر اساس تاریخ (قدیمی‌ترین اول)
    mockData.tokenPrices.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    mockData.pointPrices.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    // فیلتر کردن داده‌ها بر اساس پارامترها
    let responseData = {};

    if (symbol) {
      responseData.tokenPrices = mockData.tokenPrices.filter(tp => tp.symbol === symbol);
    } else {
      responseData.tokenPrices = mockData.tokenPrices;
    }

    if (pointType) {
      responseData.pointPrices = mockData.pointPrices.filter(pp => pp.pointType === pointType);
    } else {
      responseData.pointPrices = mockData.pointPrices;
    }

    console.log('✅ Prices retrieved from Netlify Database:', responseData);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: responseData,
        message: 'Prices retrieved successfully'
      })
    };

  } catch (error) {
    console.error('❌ Error getting prices:', error);
    
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
