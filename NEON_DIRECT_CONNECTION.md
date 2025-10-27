# راهنمای اتصال مستقیم به دیتابیس Neon

## 🚀 **اتصال مستقیم بدون API Server**

این راهنما نحوه اتصال مستقیم به دیتابیس Neon را بدون نیاز به API server توضیح می‌دهد.

## 📋 **مراحل راه‌اندازی:**

### **1. دریافت API Key از Neon Console**

1. به [Neon Console](https://console.neon.tech/) بروید
2. پروژه خود را انتخاب کنید
3. به بخش **Settings** > **API Keys** بروید
4. یک API Key جدید ایجاد کنید
5. API Key را کپی کنید

### **2. دریافت Project ID و Branch ID**

1. در Neon Console، به پروژه خود بروید
2. **Project ID** را از URL کپی کنید
3. **Branch ID** را از بخش Branches کپی کنید

### **3. به‌روزرسانی فایل `neon-direct-service.js`**

```javascript
// در فایل js/neon-direct-service.js
const NEON_API_KEY = 'your-neon-api-key-here';
const PROJECT_ID = 'your-project-id-here';
const BRANCH_ID = 'your-branch-id-here';
```

### **4. تست اتصال**

```javascript
// تست اتصال مستقیم
const neonService = new NeonDirectService();
await neonService.testDirectConnection();
```

## 🔧 **نحوه استفاده:**

### **ذخیره قیمت توکن:**
```javascript
const tokenData = {
  symbol: 'IAM',
  name: 'IAM Token',
  priceUsd: '1.28e-15',
  priceDai: '1.28e-15',
  marketCap: '1000000',
  totalSupply: '1000000000',
  decimals: 18,
  source: 'contract'
};

await neonService.saveTokenPriceDirect(tokenData);
```

### **ذخیره قیمت پوینت:**
```javascript
const pointData = {
  pointType: 'binary_points',
  pointValueUsd: '15.63',
  pointValueIam: '0.1',
  source: 'contract'
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

### **✅ مزایا:**
1. **بدون API Server**: نیازی به راه‌اندازی سرور نیست
2. **سرعت بالا**: اتصال مستقیم به Neon
3. **سادگی**: کمتر پیچیدگی در کد
4. **مقیاس‌پذیری**: استفاده از Neon REST API

### **⚠️ نکات مهم:**
1. **امنیت**: API Key را محرمانه نگه دارید
2. **Rate Limiting**: محدودیت درخواست‌ها را در نظر بگیرید
3. **Error Handling**: مدیریت خطاها را پیاده‌سازی کنید

## 🔒 **امنیت:**

### **1. مخفی کردن API Key:**
```javascript
// استفاده از متغیرهای محیطی
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

// اتصال
await neonService.connect();

// ذخیره داده
const tokenData = {
  symbol: 'IAM',
  name: 'IAM Token',
  priceUsd: '1.28e-15',
  priceDai: '1.28e-15',
  marketCap: '1000000',
  totalSupply: '1000000000',
  decimals: 18,
  source: 'contract'
};

await neonService.saveTokenPriceDirect(tokenData);

// دریافت داده
const latestPrice = await neonService.getLatestTokenPriceDirect('IAM');
console.log('Latest price:', latestPrice);
```

## 🎉 **نتیجه:**

حالا می‌توانید مستقیماً به دیتابیس Neon متصل شوید بدون نیاز به API server! 🚀
