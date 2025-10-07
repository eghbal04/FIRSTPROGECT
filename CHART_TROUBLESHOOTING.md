# راهنمای عیب‌یابی چارت قیمت

## مشکلات رایج و راه‌حل‌ها

### 1. چارت‌ها نمایش داده نمی‌شوند

**علت:** API Server در حال اجرا نیست

**راه‌حل:**
```bash
# در پوشه api
cd api
node price-api.js
```

یا از فایل batch استفاده کنید:
```bash
api/start-server.bat
```

### 2. خطای "Failed to fetch"

**علت:** اتصال به localhost:3000 ناموفق

**راه‌حل:**
- مطمئن شوید API server در حال اجرا است
- پورت 3000 آزاد است
- فایروال مانع اتصال نمی‌شود

### 3. چارت‌ها خالی هستند

**علت:** عدم وجود داده در دیتابیس

**راه‌حل:**
- از نسخه ساده استفاده کنید: `price-charts-simple.html`
- یا API server را راه‌اندازی کنید

### 4. خطای MetaMask

**علت:** MetaMask متصل نیست

**راه‌حل:**
- MetaMask را نصب کنید
- به شبکه Polygon متصل شوید
- کیف پول را متصل کنید

### 5. خطای Chart.js

**علت:** Chart.js لود نشده

**راه‌حل:**
- اتصال اینترنت را بررسی کنید
- CDN در دسترس است
- JavaScript فعال است

## نسخه‌های مختلف

### 1. نسخه کامل (price-charts.html)
- نیاز به API server
- نیاز به MetaMask
- نیاز به دیتابیس Neon
- داده‌های واقعی از بلاکچین

### 2. نسخه ساده (price-charts-simple.html)
- بدون نیاز به API
- بدون نیاز به MetaMask
- داده‌های نمونه
- مناسب برای تست

## مراحل عیب‌یابی

### مرحله 1: بررسی API Server
```bash
curl http://localhost:3000/api/health
```

### مرحله 2: بررسی Chart.js
```javascript
console.log(typeof Chart); // باید "function" باشد
```

### مرحله 3: بررسی Canvas Elements
```javascript
const tokenCanvas = document.getElementById('tokenChart');
const pointCanvas = document.getElementById('pointChart');
console.log(tokenCanvas, pointCanvas);
```

### مرحله 4: بررسی Console
- F12 را فشار دهید
- به تب Console بروید
- خطاها را بررسی کنید

## راه‌حل‌های سریع

### 1. استفاده از نسخه ساده
```html
<!-- به جای price-charts.html از این استفاده کنید -->
<a href="price-charts-simple.html">Price Charts (Simple)</a>
```

### 2. راه‌اندازی API Server
```bash
# در پوشه api
npm install
node price-api.js
```

### 3. بررسی وابستگی‌ها
```bash
# در پوشه اصلی
npm install
```

## تماس با پشتیبانی

اگر مشکلات ادامه داشت:
1. Console errors را کپی کنید
2. مراحل انجام شده را بنویسید
3. نسخه مرورگر را ذکر کنید
