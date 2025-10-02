# راهنمای رفع خطاها

## خطاهای رایج و راه‌حل‌ها

### 1. خطای "exports is not defined"

**مشکل:**
```
Uncaught ReferenceError: exports is not defined
```

**علت:** فایل‌های Node.js در مرورگر اجرا می‌شوند

**راه‌حل:**
- فایل `js/index.js` اضافه شده است
- این فایل متغیرهای Node.js را برای مرورگر تعریف می‌کند

### 2. خطای "await is only valid in async functions"

**مشکل:**
```
Uncaught SyntaxError: await is only valid in async functions and the top level bodies of modules
```

**علت:** استفاده از `await` در تابع غیر async

**راه‌حل:**
- تمام توابعی که از `await` استفاده می‌کنند باید `async` باشند
- مثال: `async function clearDatabaseData()`

### 3. خطای MetaMask RPC

**مشکل:**
```
MetaMask - RPC Error: The method "isDefaultWallet" does not exist
```

**علت:** Extension های مرورگر خطاهای غیرضروری تولید می‌کنند

**راه‌حل:**
- Error handlers اضافه شده‌اند
- خطاهای extension ها suppress می‌شوند

## فایل‌های اضافه شده:

### `js/index.js`
```javascript
// Browser compatibility layer
if (typeof exports === 'undefined') {
  window.exports = {};
}

if (typeof module === 'undefined') {
  window.module = { exports: {} };
}

if (typeof require === 'undefined') {
  window.require = function(id) {
    console.warn('require() called but not available in browser:', id);
    return {};
  };
}
```

### Error Suppression در HTML
```javascript
// Suppress extension errors
window.addEventListener('error', function(e){
  const m = (e && e.message) || '';
  if (m.includes('MetaMask - RPC Error') || 
      m.includes('isDefaultWallet') ||
      m.includes('exports is not defined')) {
    e.preventDefault();
    return false;
  }
});
```

## تست کردن:

1. فایل `test-errors.html` را باز کنید
2. Console را بررسی کنید
3. خطاها باید suppress شوند

## نکات مهم:

1. **همیشه از async/await درست استفاده کنید**
2. **Error handlers را اضافه کنید**
3. **Extension errors را suppress کنید**
4. **Browser compatibility را در نظر بگیرید**

## خطاهای احتمالی دیگر:

### خطای CORS
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**راه‌حل:** از proxy یا CORS-enabled API استفاده کنید

### خطای Network
```
Failed to fetch
```

**راه‌حل:** اتصال اینترنت و API endpoint را بررسی کنید

### خطای Contract
```
Contract method not found
```

**راه‌حل:** ABI و آدرس کنترکت را بررسی کنید

## Debugging:

1. **Console را باز کنید** (F12)
2. **Network tab را بررسی کنید**
3. **Sources tab را بررسی کنید**
4. **خطاها را در Console دنبال کنید**

## تماس با پشتیبانی:

اگر خطاها ادامه داشتند:
1. Console logs را کپی کنید
2. مرورگر و نسخه را مشخص کنید
3. Extension های فعال را لیست کنید
4. Screenshot از خطا بگیرید
