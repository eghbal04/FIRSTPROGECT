# راهنمای تست Firebase برای تاریخچه قیمت

## 🔥 تست Firebase Integration

### 1. راه‌اندازی Firebase
قبل از تست، مطمئن شوید که Firebase را راه‌اندازی کرده‌اید:

1. **ایجاد پروژه Firebase**:
   - به [Firebase Console](https://console.firebase.google.com/) بروید
   - پروژه جدید ایجاد کنید
   - Firestore Database را فعال کنید

2. **تنظیم Security Rules**:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /price_history/{document} {
         allow read, write: if true; // برای تست - در تولید محدود کنید
       }
     }
   }
   ```

3. **اضافه کردن Web App**:
   - در Firebase Console، روی "Add app" کلیک کنید
   - Web app انتخاب کنید
   - کد پیکربندی را کپی کنید

4. **به‌روزرسانی فایل `js/firebase-config.js`**:
   ```javascript
   const firebaseConfig = {
       apiKey: "your-actual-api-key",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "123456789",
       appId: "your-app-id"
   };
   ```

### 2. تست دستورات کنسول

#### تست اتصال Firebase:
```javascript
// بررسی وضعیت Firebase
window.firebasePriceHistory.getStats().then(stats => {
    console.log('Firebase Stats:', stats);
});

// بررسی تاریخچه
window.getFirebaseHistory().then(history => {
    console.log('Firebase History:', history);
});
```

#### تست ذخیره داده:
```javascript
// ذخیره قیمت تست
window.firebasePriceHistory.save(0.001234, 0.005678).then(result => {
    console.log('Save result:', result);
});
```

#### تست آمار:
```javascript
// دریافت آمار Firebase
window.getFirebaseStats().then(stats => {
    console.log('Firebase Statistics:', stats);
});
```

#### تست صادر کردن:
```javascript
// صادر کردن به JSON
window.exportFirebaseHistory('json').then(result => {
    console.log('Export result:', result);
});

// صادر کردن به CSV
window.exportFirebaseHistory('csv').then(result => {
    console.log('CSV Export result:', result);
});
```

#### تست پاک کردن:
```javascript
// پاک کردن داده‌های قدیمی‌تر از 7 روز
window.cleanupFirebaseHistory(7).then(result => {
    console.log('Cleanup result:', result);
});
```

### 3. تست چارت‌ها

#### بررسی بارگذاری داده‌های تاریخی:
```javascript
// بررسی وضعیت PriceHistoryManager
console.log('Firebase Enabled:', window.priceHistoryManager.isFirebaseEnabled());
console.log('Token History Count:', window.priceHistoryManager.tokenHistory.length);
console.log('Point History Count:', window.priceHistoryManager.pointHistory.length);
```

#### تست به‌روزرسانی چارت‌ها:
```javascript
// به‌روزرسانی دستی
window.updatePrices();

// نمایش آمار
window.showPriceStats();
```

### 4. تست عملکرد

#### تست ذخیره خودکار:
1. سایت را باز کنید
2. کنسول را باز کنید
3. منتظر بمانید تا قیمت‌ها به‌روزرسانی شوند
4. بررسی کنید که داده‌ها در Firebase ذخیره می‌شوند:

```javascript
// بررسی آخرین رکوردهای ذخیره شده
window.getFirebaseHistory().then(history => {
    console.log('Latest records:', history.slice(0, 5));
});
```

#### تست بارگذاری داده‌های تاریخی:
1. سایت را رفرش کنید
2. بررسی کنید که چارت‌ها با داده‌های تاریخی پر می‌شوند:

```javascript
// بررسی داده‌های بارگذاری شده
console.log('Token History:', window.priceHistoryManager.tokenHistory);
console.log('Point History:', window.priceHistoryManager.pointHistory);
```

### 5. تست خطاها

#### تست بدون Firebase:
```javascript
// شبیه‌سازی عدم دسترسی به Firebase
window.firebasePriceHistory = null;
location.reload(); // رفرش صفحه
```

#### تست خطای اتصال:
```javascript
// شبیه‌سازی خطای اتصال
window.firebasePriceHistory.get = () => Promise.reject(new Error('Connection failed'));
```

### 6. دستورات مفید

#### مدیریت داده‌ها:
```javascript
// پاک کردن تمام تاریخچه
window.clearPriceHistory();

// صادر کردن داده‌ها
window.exportPriceData();

// تنظیم فرکانس به‌روزرسانی (ثانیه)
window.setUpdateFrequency(60);

// توقف به‌روزرسانی خودکار
window.stopAutoUpdate();

// شروع به‌روزرسانی خودکار
window.startAutoUpdate();
```

#### بررسی وضعیت:
```javascript
// بررسی وضعیت کلی
console.log('Price Charts Manager:', window.priceChartsManager);
console.log('Price History Manager:', window.priceHistoryManager);
console.log('Firebase Price History:', window.firebasePriceHistory);
```

### 7. عیب‌یابی

#### مشکلات رایج:

1. **Firebase بارگذاری نمی‌شود**:
   - بررسی کنید که اسکریپت‌های Firebase در `index.html` اضافه شده‌اند
   - بررسی کنید که `firebase-config.js` قبل از سایر اسکریپت‌ها بارگذاری می‌شود

2. **داده‌ها ذخیره نمی‌شوند**:
   - بررسی Security Rules در Firebase Console
   - بررسی اتصال اینترنت
   - بررسی کنسول برای خطاها

3. **چارت‌ها خالی هستند**:
   - بررسی کنید که `PriceHistoryManager` بارگذاری شده است
   - بررسی کنید که داده‌ها از Firebase بارگذاری می‌شوند

#### لاگ‌های مفید:
```javascript
// فعال کردن لاگ‌های مفصل
localStorage.setItem('debug', 'true');

// بررسی لاگ‌ها
console.log('Debug mode:', localStorage.getItem('debug'));
```

### 8. تست عملکرد

#### تست سرعت:
```javascript
// تست سرعت ذخیره
const startTime = Date.now();
window.firebasePriceHistory.save(0.001, 0.002).then(() => {
    const endTime = Date.now();
    console.log(`ذخیره در ${endTime - startTime} میلی‌ثانیه`);
});

// تست سرعت بارگذاری
const loadStartTime = Date.now();
window.getFirebaseHistory().then(() => {
    const loadEndTime = Date.now();
    console.log(`بارگذاری در ${loadEndTime - loadStartTime} میلی‌ثانیه`);
});
```

### 9. تست امنیت

#### تست Security Rules:
```javascript
// تست خواندن
window.getFirebaseHistory().then(result => {
    console.log('Read test:', result.length > 0 ? 'SUCCESS' : 'FAILED');
});

// تست نوشتن
window.firebasePriceHistory.save(0.001, 0.002).then(result => {
    console.log('Write test:', result ? 'SUCCESS' : 'FAILED');
});
```

### 10. تست یکپارچگی

#### تست کامل:
1. سایت را باز کنید
2. منتظر بمانید تا قیمت‌ها به‌روزرسانی شوند
3. صفحه را رفرش کنید
4. بررسی کنید که چارت‌ها با داده‌های تاریخی پر می‌شوند
5. بررسی کنید که قیمت‌های جدید ذخیره می‌شوند

```javascript
// تست یکپارچگی کامل
async function testFullIntegration() {
    console.log('🧪 شروع تست یکپارچگی...');
    
    // تست Firebase
    const stats = await window.getFirebaseStats();
    console.log('Firebase Stats:', stats);
    
    // تست تاریخچه
    const history = await window.getFirebaseHistory();
    console.log('History Count:', history.length);
    
    // تست چارت‌ها
    const chartStats = window.showPriceStats();
    console.log('Chart Stats:', chartStats);
    
    console.log('✅ تست یکپارچگی کامل شد');
}

testFullIntegration();
```

---

## 📝 نکات مهم

- **Firebase Config**: حتماً مقادیر واقعی Firebase را در `js/firebase-config.js` قرار دهید
- **Security Rules**: در محیط تولید، Security Rules را محدود کنید
- **Error Handling**: سیستم خطاها را بررسی کنید
- **Performance**: سرعت بارگذاری و ذخیره را مانیتور کنید
- **Backup**: از داده‌های مهم پشتیبان تهیه کنید 