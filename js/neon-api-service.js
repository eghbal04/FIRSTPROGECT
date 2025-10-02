// Neon Database API Service
// این سرویس برای تعامل با دیتابیس Neon PostgreSQL استفاده می‌شود

class NeonApiService {
  constructor() {
    this.baseUrl = 'http://localhost:3000'; // آدرس API محلی
    this.apiKey = 'neon-api-key-2024'; // کلید API محلی
  }

  // تنظیمات اولیه
  async initialize() {
    try {
      console.log('🔄 Initializing Neon API Service...');
      
      // تست اتصال
      const testResult = await this.testConnection();
      if (testResult.success) {
        console.log('✅ Neon API Service initialized successfully');
        return true;
      } else {
        console.warn('⚠️ Neon API Service initialization failed, using localStorage fallback');
        return false;
      }
    } catch (error) {
      console.error('❌ Error initializing Neon API Service:', error);
      return false;
    }
  }

  // تست اتصال به API
  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      if (response.ok) {
        return { success: true, data: await response.json() };
      } else {
        return { success: false, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ذخیره قیمت توکن
  async saveTokenPrice(priceData) {
    try {
      const response = await fetch(`${this.baseUrl}/api/token-prices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          symbol: priceData.symbol,
          name: priceData.name,
          price_usd: priceData.priceUsd,
          price_dai: priceData.priceDai,
          market_cap: priceData.marketCap,
          total_supply: priceData.totalSupply,
          decimals: priceData.decimals,
          source: priceData.source || 'contract',
          timestamp: priceData.timestamp || new Date().toISOString()
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Token price saved to Neon database:', result);
        return result;
      } else {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
    } catch (error) {
      console.error('❌ Error saving token price to Neon:', error);
      throw error;
    }
  }

  // ذخیره قیمت پوینت
  async savePointPrice(pointData) {
    try {
      const response = await fetch(`${this.baseUrl}/api/point-prices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          point_type: pointData.pointType,
          point_value_usd: pointData.pointValueUsd,
          point_value_iam: pointData.pointValueIam,
          source: pointData.source || 'contract',
          timestamp: pointData.timestamp || new Date().toISOString()
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Point price saved to Neon database:', result);
        return result;
      } else {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
    } catch (error) {
      console.error('❌ Error saving point price to Neon:', error);
      throw error;
    }
  }

  // دریافت آخرین قیمت توکن
  async getLatestTokenPrice(symbol) {
    try {
      const response = await fetch(`${this.baseUrl}/api/token-prices?symbol=${symbol}&hours=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📊 Latest token price from Neon:', result);
        if (result.success && result.data && result.data.length > 0) {
          return result.data[0]; // Return the first (latest) record
        }
        return null;
      } else if (response.status === 404) {
        console.log('⚠️ No token price data found in Neon database');
        return null;
      } else {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
    } catch (error) {
      console.error('❌ Error getting latest token price from Neon:', error);
      return null;
    }
  }

  // دریافت آخرین قیمت پوینت
  async getLatestPointPrice(pointType) {
    try {
      const response = await fetch(`${this.baseUrl}/api/point-prices?pointType=${pointType}&hours=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📊 Latest point price from Neon:', result);
        if (result.success && result.data && result.data.length > 0) {
          return result.data[0]; // Return the first (latest) record
        }
        return null;
      } else if (response.status === 404) {
        console.log('⚠️ No point price data found in Neon database');
        return null;
      } else {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
    } catch (error) {
      console.error('❌ Error getting latest point price from Neon:', error);
      return null;
    }
  }

  // دریافت تاریخچه قیمت توکن
  async getTokenPriceHistory(symbol, hours = 24) {
    try {
      const response = await fetch(`${this.baseUrl}/prices/token/${symbol}/history?hours=${hours}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`📊 Token price history from Neon (${result.length} points):`, result);
        return result;
      } else if (response.status === 404) {
        console.log('⚠️ No token price history found in Neon database');
        return [];
      } else {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
    } catch (error) {
      console.error('❌ Error getting token price history from Neon:', error);
      return [];
    }
  }

  // دریافت تاریخچه قیمت پوینت
  async getPointPriceHistory(pointType, hours = 24) {
    try {
      const response = await fetch(`${this.baseUrl}/prices/point/${pointType}/history?hours=${hours}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`📊 Point price history from Neon (${result.length} points):`, result);
        return result;
      } else if (response.status === 404) {
        console.log('⚠️ No point price history found in Neon database');
        return [];
      } else {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
    } catch (error) {
      console.error('❌ Error getting point price history from Neon:', error);
      return [];
    }
  }

  // دریافت آمار کلی
  async getPriceStats() {
    try {
      const response = await fetch(`${this.baseUrl}/prices/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📊 Price stats from Neon:', result);
        return result;
      } else {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
    } catch (error) {
      console.error('❌ Error getting price stats from Neon:', error);
      return null;
    }
  }

  // پاک کردن تاریخچه قدیمی (بیش از 30 روز)
  async cleanupOldData() {
    try {
      const response = await fetch(`${this.baseUrl}/prices/cleanup`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Old price data cleaned up:', result);
        return result;
      } else {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
    } catch (error) {
      console.error('❌ Error cleaning up old data:', error);
      return null;
    }
  }

  // دریافت تمام داده‌های قیمت (برای دیباگ)
  async getAllPriceData() {
    try {
      const response = await fetch(`${this.baseUrl}/prices/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📊 All price data from Neon:', result);
        return result;
      } else {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
    } catch (error) {
      console.error('❌ Error getting all price data from Neon:', error);
      return null;
    }
  }
}

// Export for browser
window.NeonApiService = NeonApiService;
