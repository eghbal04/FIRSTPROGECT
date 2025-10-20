# راهنمای سرویس قیمت‌های لحظه‌ای

این راهنما نحوه استفاده از سرویس قیمت‌های لحظه‌ای توکن و پوینت را توضیح می‌دهد.

## 🚀 شروع سریع

### 1. Import کردن سرویس
```javascript
import PriceService from './price-service.js';

const priceService = new PriceService();
```

### 2. ذخیره قیمت لحظه‌ای توکن
```javascript
await priceService.saveTokenPrice({
  symbol: 'IAM',
  address: '0x2D3923A5ba62B2bec13b9181B1E9AE0ea2C8118D',
  priceUsd: 0.001234,
  priceDai: 0.001234,
  marketCap: 1234567.89,
  volume24h: 12345.67,
  priceChange24h: 5.25,
  source: 'api'
});
```

### 3. ذخیره قیمت لحظه‌ای پوینت
```javascript
await priceService.savePointPrice({
  pointType: 'binary_points',
  pointValue: 0.000123,
  pointValueUsd: 0.000123,
  pointValueIam: 0.1,
  totalSupply: 1000000000.00,
  source: 'contract'
});
```

## 📊 جداول دیتابیس

### جدول token_prices
```sql
CREATE TABLE token_prices (
  id SERIAL PRIMARY KEY,
  token_symbol VARCHAR(20) NOT NULL,
  token_address VARCHAR(42),
  price_usd DECIMAL(20,8) NOT NULL,
  price_eth DECIMAL(20,8),
  price_dai DECIMAL(20,8),
  market_cap DECIMAL(20,2),
  volume_24h DECIMAL(20,2),
  price_change_24h DECIMAL(10,4),
  source VARCHAR(50) DEFAULT 'api',
  block_number BIGINT,
  transaction_hash VARCHAR(66),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### جدول point_prices
```sql
CREATE TABLE point_prices (
  id SERIAL PRIMARY KEY,
  point_type VARCHAR(50) NOT NULL,
  point_value DECIMAL(20,8) NOT NULL,
  point_value_usd DECIMAL(20,8),
  point_value_iam DECIMAL(20,8),
  total_supply DECIMAL(20,2),
  circulating_supply DECIMAL(20,2),
  source VARCHAR(50) DEFAULT 'contract',
  block_number BIGINT,
  transaction_hash VARCHAR(66),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### جدول price_history
```sql
CREATE TABLE price_history (
  id SERIAL PRIMARY KEY,
  asset_type VARCHAR(20) NOT NULL,
  asset_symbol VARCHAR(20) NOT NULL,
  price DECIMAL(20,8) NOT NULL,
  price_usd DECIMAL(20,8),
  volume DECIMAL(20,2),
  market_cap DECIMAL(20,2),
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 متدهای سرویس

### ذخیره قیمت توکن
```javascript
await priceService.saveTokenPrice({
  symbol: 'IAM',                    // نماد توکن
  address: '0x...',                 // آدرس قرارداد
  priceUsd: 0.001234,              // قیمت به دلار
  priceEth: 0.000001,              // قیمت به اتریوم (اختیاری)
  priceDai: 0.001234,              // قیمت به DAI
  marketCap: 1234567.89,           // ارزش بازار
  volume24h: 12345.67,             // حجم 24 ساعته
  priceChange24h: 5.25,            // تغییر قیمت 24 ساعته
  source: 'api',                   // منبع داده
  blockNumber: 12345678,           // شماره بلاک (اختیاری)
  transactionHash: '0x...'         // هش تراکنش (اختیاری)
});
```

### ذخیره قیمت پوینت
```javascript
await priceService.savePointPrice({
  pointType: 'binary_points',      // نوع پوینت
  pointValue: 0.000123,           // ارزش پوینت
  pointValueUsd: 0.000123,        // ارزش به دلار
  pointValueIam: 0.1,             // ارزش به IAM
  totalSupply: 1000000000.00,     // عرضه کل
  circulatingSupply: 500000000.00, // عرضه در گردش
  source: 'contract',              // منبع داده
  blockNumber: 12345678,          // شماره بلاک (اختیاری)
  transactionHash: '0x...'        // هش تراکنش (اختیاری)
});
```

### دریافت آخرین قیمت توکن
```javascript
const iamPrice = await priceService.getLatestTokenPrice('IAM');
console.log('قیمت IAM:', iamPrice.price_usd);
```

### دریافت آخرین قیمت پوینت
```javascript
const binaryPointsPrice = await priceService.getLatestPointPrice('binary_points');
console.log('قیمت Binary Points:', binaryPointsPrice.point_value);
```

### دریافت همه قیمت‌های لحظه‌ای
```javascript
const allPrices = await priceService.getAllLatestPrices();
console.log('قیمت توکن‌ها:', allPrices.tokens);
console.log('قیمت پوینت‌ها:', allPrices.points);
```

### دریافت تاریخچه قیمت
```javascript
// تاریخچه 24 ساعته
const history = await priceService.getPriceHistory('token', 'IAM', 24);

// تاریخچه 7 روزه
const weekHistory = await priceService.getPriceHistory('token', 'IAM', 168);
```

### ذخیره تاریخچه قیمت
```javascript
await priceService.savePriceHistory({
  assetType: 'token',              // نوع دارایی
  assetSymbol: 'IAM',              // نماد دارایی
  price: 0.001234,                // قیمت
  priceUsd: 0.001234,             // قیمت به دلار
  volume: 12345.67,               // حجم
  marketCap: 1234567.89,          // ارزش بازار
  timestamp: new Date().toISOString() // زمان
});
```

### پاک کردن داده‌های قدیمی
```javascript
const cleanupResult = await priceService.cleanupOldData();
console.log('داده‌های پاک شده:', cleanupResult);
```

## 🔄 مثال کامل استفاده

```javascript
import PriceService from './price-service.js';

async function updatePrices() {
  const priceService = new PriceService();
  
  try {
    // دریافت قیمت از API
    const apiResponse = await fetch('https://api.example.com/price/IAM');
    const priceData = await apiResponse.json();
    
    // ذخیره قیمت توکن
    await priceService.saveTokenPrice({
      symbol: 'IAM',
      address: '0x2D3923A5ba62B2bec13b9181B1E9AE0ea2C8118D',
      priceUsd: priceData.price_usd,
      priceDai: priceData.price_dai,
      marketCap: priceData.market_cap,
      volume24h: priceData.volume_24h,
      priceChange24h: priceData.price_change_24h,
      source: 'api'
    });
    
    // ذخیره تاریخچه قیمت
    await priceService.savePriceHistory({
      assetType: 'token',
      assetSymbol: 'IAM',
      price: priceData.price_usd,
      priceUsd: priceData.price_usd,
      volume: priceData.volume_24h,
      marketCap: priceData.market_cap,
      timestamp: new Date().toISOString()
    });
    
    // دریافت آخرین قیمت
    const latestPrice = await priceService.getLatestTokenPrice('IAM');
    console.log('آخرین قیمت IAM:', latestPrice.price_usd);
    
  } catch (error) {
    console.error('خطا در به‌روزرسانی قیمت:', error);
  }
}

// اجرای هر 5 دقیقه
setInterval(updatePrices, 5 * 60 * 1000);
```

## 📈 استفاده در پروژه Web3

### 1. در فایل اصلی
```javascript
// اضافه کردن به utility.html
import PriceService from './price-service.js';

const priceService = new PriceService();

// نمایش قیمت لحظه‌ای
async function showLivePrice() {
  try {
    const iamPrice = await priceService.getLatestTokenPrice('IAM');
    const binaryPointsPrice = await priceService.getLatestPointPrice('binary_points');
    
    document.getElementById('iam-price').textContent = `$${iamPrice.price_usd}`;
    document.getElementById('points-price').textContent = `$${binaryPointsPrice.point_value}`;
  } catch (error) {
    console.error('خطا در دریافت قیمت:', error);
  }
}

// به‌روزرسانی هر 30 ثانیه
setInterval(showLivePrice, 30000);
```

### 2. در فایل sales.html
```javascript
// محاسبه قیمت فروش
async function calculateSalePrice(amount) {
  try {
    const iamPrice = await priceService.getLatestTokenPrice('IAM');
    const daiPrice = await priceService.getLatestTokenPrice('DAI');
    
    const iamValue = amount * parseFloat(iamPrice.price_usd);
    const daiValue = iamValue / parseFloat(daiPrice.price_usd);
    
    return daiValue;
  } catch (error) {
    console.error('خطا در محاسبه قیمت:', error);
    return 0;
  }
}
```

## 🚨 نکات مهم

1. **مدیریت خطا**: همیشه از try-catch استفاده کنید
2. **بهینه‌سازی**: از ایندکس‌ها برای جستجوی سریع استفاده کنید
3. **پاکسازی**: داده‌های قدیمی را پاک کنید
4. **امنیت**: URL دیتابیس را در متغیرهای محیطی نگه دارید
5. **عملکرد**: از connection pooling استفاده کنید

## 🔧 تنظیمات پیشرفته

### تنظیم متغیرهای محیطی
```bash
# در فایل .env
NETLIFY_DATABASE_URL=postgresql://username:password@hostname:port/database?sslmode=require
```

### تنظیم connection pooling
```javascript
const sql = neon(dbUrl, {
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 20
});
```

## 📚 منابع بیشتر

- [Neon Documentation](https://neon.tech/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
