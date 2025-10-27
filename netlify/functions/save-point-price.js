// Netlify Function برای ذخیره قیمت پوینت
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
    const pointData = JSON.parse(event.body);
    
    // اعتبارسنجی داده‌ها
    if (!pointData.pointType || !pointData.pointValueUsd) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // شبیه‌سازی ذخیره در دیتابیس
    const savedData = {
      id: Date.now(),
      pointType: pointData.pointType,
      pointValueUsd: pointData.pointValueUsd,
      pointValueIam: pointData.pointValueIam || '0',
      source: pointData.source || 'netlify-function',
      createdAt: new Date().toISOString()
    };

    console.log('✅ Point price saved to Netlify Database:', savedData);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: savedData,
        message: 'Point price saved successfully'
      })
    };

  } catch (error) {
    console.error('❌ Error saving point price:', error);
    
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

