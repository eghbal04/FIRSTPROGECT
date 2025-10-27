# راهنمای اتصال مستقیم به Neon Console

## 🚀 **اتصال مستقیم بدون localStorage**

این راهنما نحوه اتصال مستقیم به Neon Console را توضیح می‌دهد.

## 📋 **مراحل راه‌اندازی:**

### **1. دریافت API Key از Neon Console**

1. به [Neon Console](https://console.neon.tech/) بروید
2. پروژه خود را انتخاب کنید
3. به بخش **Settings** > **API Keys** بروید
4. یک API Key جدید ایجاد کنید
5. API Key را کپی کنید

### **2. دریافت Project ID و Branch ID**

1. در Neon Console، به پروژه خود بروید
2. **Project ID** را از URL کپی کنید (مثل: `ep-calm-leaf-aehi0krv`)
3. **Branch ID** را از بخش Branches کپی کنید (معمولاً `main`)

### **3. به‌روزرسانی فایل `neon-direct-service.js`**

```javascript
// در فایل js/neon-direct-service.js
constructor() {
  this.NEON_API_KEY = 'your-actual-api-key-here';
  this.PROJECT_ID = 'your-actual-project-id-here';
  this.BRANCH_ID = 'your-actual-branch-id-here';
  this.API_BASE_URL = 'https://api.neon.tech/v1';
  this.isConnected = false;
  this.client = null;
}
```

### **4. ایجاد جداول در Neon Console**

قبل از استفاده، جداول را در Neon Console ایجاد کنید:

```sql
-- ایجاد جدول token_prices
CREATE TABLE token_prices (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL,
  name VARCHAR(100) NOT NULL,
  price_usd TEXT NOT NULL,
  price_dai TEXT NOT NULL,
  market_cap TEXT NOT NULL,
  total_supply TEXT NOT NULL,
  decimals INTEGER NOT NULL,
  source VARCHAR(50) DEFAULT 'direct',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ایجاد جدول point_prices
CREATE TABLE point_prices (
  id SERIAL PRIMARY KEY,
  point_type VARCHAR(50) NOT NULL,
  point_value_usd TEXT NOT NULL,
  point_value_iam TEXT NOT NULL,
  source VARCHAR(50) DEFAULT 'direct',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ایجاد ایندکس‌ها
CREATE INDEX idx_token_prices_symbol_created ON token_prices(symbol, created_at DESC);
CREATE INDEX idx_point_prices_type_created ON point_prices(point_type, created_at DESC);
```

## 🔧 **نحوه استفاده:**

### **اتصال مستقیم:**
```javascript
const neonService = new NeonDirectService();
await neonService.connect(); // اتصال مستقیم به Neon Console
```

### **ذخیره قیمت توکن:**
```javascript
const tokenData = {
  symbol: 'IAM',
  name: 'IAM Token',
  priceUsd: '1.32e-15',
  priceDai: '1.32e-15',
  marketCap: '6915.28',
  totalSupply: '1000000000',
  decimals: 18,
  source: 'blockchain'
};

await neonService.saveTokenPriceDirect(tokenData);
```

### **ذخیره قیمت پوینت:**
```javascript
const pointData = {
  pointType: 'binary_points',
  pointValueUsd: '11.77',
  pointValueIam: '8949171897668565.00',
  source: 'blockchain'
};

await neonService.savePointPriceDirect(pointData);
```

### **دریافت آخرین قیمت:**
```javascript
// دریافت آخرین قیمت توکن
const latestToken = await neonService.getLatestTokenPriceDirect('IAM');

// دریافت آخرین قیمت پوینت
const latestPoint = await neonService.getLatestPointPriceDirect('binary_points');
```

### **دریافت تاریخچه:**
```javascript
// تاریخچه قیمت توکن (24 ساعت)
const tokenHistory = await neonService.getPriceHistoryDirect('token', 'IAM', 24);

// تاریخچه قیمت پوینت (24 ساعت)
const pointHistory = await neonService.getPriceHistoryDirect('point', 'binary_points', 24);
```

## 🎯 **مزایای اتصال مستقیم:**

### ✅ **مزایا:**
1. **بدون localStorage**: داده‌ها مستقیماً در Neon ذخیره می‌شوند
2. **سرعت بالا**: اتصال مستقیم به Neon Console
3. **قابلیت اطمینان**: داده‌ها در دیتابیس ابری ذخیره می‌شوند
4. **مقیاس‌پذیری**: استفاده از Neon REST API

### ⚠️ **نکات مهم:**
1. **امنیت**: API Key را محرمانه نگه دارید
2. **Rate Limiting**: محدودیت درخواست‌ها را در نظر بگیرید
3. **Error Handling**: مدیریت خطاها را پیاده‌سازی کنید

## 🔒 **امنیت:**

### **1. مخفی کردن API Key:**
```javascript
// استفاده از متغیرهای محیطی (در production)
const NEON_API_KEY = process.env.NEON_API_KEY || 'your-api-key';
```

### **2. محدود کردن دسترسی:**
```javascript
// بررسی دامنه
if (window.location.hostname !== 'yourdomain.com') {
  console.warn('Direct Neon access restricted to production domain');
  return;
}
```

## 🚨 **عیب‌یابی:**

### **مشکل اتصال:**
```javascript
// بررسی API Key
console.log('API Key:', NEON_API_KEY ? 'Set' : 'Not Set');

// بررسی Project ID
console.log('Project ID:', PROJECT_ID ? 'Set' : 'Not Set');
```

### **مشکل CORS:**
```javascript
// اضافه کردن headers مناسب
headers: {
  'Authorization': `Bearer ${NEON_API_KEY}`,
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*'
}
```

## 📊 **مثال کامل:**

```javascript
// راه‌اندازی سرویس
const neonService = new NeonDirectService();

// اتصال مستقیم به Neon Console
await neonService.connect();

// ذخیره داده
const tokenData = {
  symbol: 'IAM',
  name: 'IAM Token',
  priceUsd: '1.32e-15',
  priceDai: '1.32e-15',
  marketCap: '6915.28',
  totalSupply: '1000000000',
  decimals: 18,
  source: 'blockchain'
};

await neonService.saveTokenPriceDirect(tokenData);

// دریافت داده
const latestPrice = await neonService.getLatestTokenPriceDirect('IAM');
console.log('Latest price:', latestPrice);
```

## 🎉 **نتیجه:**

حالا می‌توانید مستقیماً به Neon Console متصل شوید بدون نیاز به localStorage! 🚀

### **مراحل بعدی:**
1. **API Key** را از Neon Console دریافت کنید
2. **Project ID** و **Branch ID** را کپی کنید
3. فایل `neon-direct-service.js` را به‌روزرسانی کنید
4. جداول را در Neon Console ایجاد کنید
5. چارت‌ها را تست کنید
