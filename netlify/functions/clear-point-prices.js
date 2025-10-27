exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    // In this mock setup, there is no persistent point price history to clear.
    // We return success to signal the client to start recording from now.
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Point price history cleared (logical reset). Start saving from now.' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: 'Failed to clear point price history', error: error.message })
    };
  }
};




