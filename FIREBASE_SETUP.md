# راهنمای تنظیم Firebase برای ذخیره تاریخچه قیمت

## 📋 مراحل تنظیم Firebase

### ۱. ایجاد پروژه Firebase

1. به [console.firebase.google.com](https://console.firebase.google.com) بروید
2. روی **"Create a project"** کلیک کنید
3. نام پروژه را وارد کنید (مثلاً: `cpa-price-history`)
4. Google Analytics را غیرفعال کنید (اختیاری)
5. روی **"Create project"** کلیک کنید

### ۲. فعال‌سازی Firestore Database

1. در پنل Firebase، روی **"Firestore Database"** کلیک کنید
2. روی **"Create database"** کلیک کنید
3. **"Start in test mode"** را انتخاب کنید (برای تست)
4. موقعیت سرور را انتخاب کنید (مثلاً: `us-central1`)
5. روی **"Done"** کلیک کنید

### ۳. تنظیم قوانین امنیتی Firestore

در بخش **"Rules"** فایل زیر را جایگزین کنید:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // اجازه خواندن و نوشتن برای همه (فقط برای تست)
    match /{document=**} {
      allow read, write: if true;
    }
    
    // برای تولید، این قانون امن‌تر است:
    // match /price_history/{document} {
    //   allow read, write: if request.auth != null;
    // }
  }
}
```

### ۴. اضافه کردن Firebase به وب‌اپلیکیشن

1. در پنل Firebase، روی **"Project settings"** کلیک کنید
2. در بخش **"Your apps"**، روی **"Add app"** کلیک کنید
3. **"Web"** را انتخاب کنید
4. نام اپلیکیشن را وارد کنید
5. روی **"Register app"** کلیک کنید

### ۵. کپی کردن تنظیمات Firebase

کد زیر را کپی کنید و در فایل `js/firebase-config.js` جایگزین کنید:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### ۶. اضافه کردن اسکریپت Firebase به HTML

در فایل `index.html`، قبل از اسکریپت‌های خودتان، این خطوط را اضافه کنید:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>

<!-- اسکریپت‌های شما -->
<script src="js/firebase-config.js"></script>
```

## 🚀 تست Firebase

### دستورات کنسول برای تست:

```javascript
// بررسی وضعیت Firebase
console.log(window.firebasePriceHistory);

// ذخیره قیمت تست
window.firebasePriceHistory.save(0.001234, 0.000567);

// بازیابی تاریخچه
window.firebasePriceHistory.get().then(history => {
    console.log('تاریخچه قیمت:', history);
});

// دریافت آمار
window.firebasePriceHistory.getStats().then(stats => {
    console.log('آمار تاریخچه:', stats);
});

// صادر کردن تاریخچه
window.firebasePriceHistory.export('json');
window.firebasePriceHistory.export('csv');
```

## 📊 ساختار داده‌ها

هر رکورد تاریخچه قیمت شامل این فیلدها است:

```javascript
{
    id: "auto-generated-id",
    timestamp: "2025-01-15T10:30:00.000Z",
    tokenPrice: 0.001234,
    pointPrice: 0.000567,
    date: "2025-01-15T10:30:00.000Z",
    userId: "anonymous"
}
```

## 🔧 تنظیمات پیشرفته

### تنظیم محدودیت‌های امنیتی (برای تولید):

```javascript
// در قوانین Firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /price_history/{document} {
      // فقط خواندن مجاز است
      allow read: if true;
      // نوشتن فقط با احراز هویت
      allow write: if request.auth != null;
    }
  }
}
```

### تنظیم Index برای جستجوی بهتر:

در پنل Firebase > Firestore Database > Indexes:

```
Collection ID: price_history
Fields to index:
- timestamp (Ascending)
- userId (Ascending)
```

## 🛠️ عیب‌یابی

### مشکلات رایج:

1. **خطای "Firebase SDK بارگذاری نشده است"**
   - مطمئن شوید اسکریپت‌های Firebase قبل از `firebase-config.js` بارگذاری شده‌اند

2. **خطای "Permission denied"**
   - قوانین Firestore را بررسی کنید
   - در حالت تست، همه مجوزها باید باز باشند

3. **خطای "Network error"**
   - اتصال اینترنت را بررسی کنید
   - تنظیمات Firebase را دوباره بررسی کنید

## 📈 مانیتورینگ

در پنل Firebase می‌توانید:
- تعداد درخواست‌ها را مشاهده کنید
- حجم داده‌ها را بررسی کنید
- خطاها را ردیابی کنید
- عملکرد را مانیتور کنید

## 💰 هزینه‌ها

Firebase Firestore رایگان تا:
- 1GB ذخیره‌سازی
- 50,000 خواندن در روز
- 20,000 نوشتن در روز
- 20,000 حذف در روز

برای پروژه‌های کوچک و متوسط، این محدودیت‌ها کافی است. 