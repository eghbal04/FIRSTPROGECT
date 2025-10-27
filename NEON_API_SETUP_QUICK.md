# راهنمای سریع دریافت API Key از Neon Console

## 🚀 **مراحل دریافت API Key:**

### **1. ورود به Neon Console:**
```
https://console.neon.tech/
```

### **2. انتخاب پروژه:**
- پروژه خود را انتخاب کنید
- اگر پروژه ندارید، یک پروژه جدید ایجاد کنید

### **3. دریافت API Key:**
1. به بخش **Settings** بروید
2. روی **API Keys** کلیک کنید
3. **Create New Key** را کلیک کنید
4. نام API Key را وارد کنید (مثل: `price-charts-api`)
5. **Create** را کلیک کنید
6. API Key را کپی کنید

### **4. دریافت Project ID:**
- در صفحه پروژه، **Project ID** را از URL کپی کنید
- مثال: `ep-calm-leaf-aehi0krv`

### **5. دریافت Branch ID:**
- در بخش **Branches**، نام branch را کپی کنید
- معمولاً `main` است

## 🔧 **تنظیم در کد:**

### **فایل `js/neon-direct-service.js` را به‌روزرسانی کنید:**

```javascript
constructor() {
  // جایگزین کنید با API Key واقعی
  this.NEON_API_KEY = 'your-actual-api-key-here';
  
  // جایگزین کنید با Project ID واقعی
  this.PROJECT_ID = 'your-actual-project-id-here';
  
  // جایگزین کنید با Branch ID واقعی
  this.BRANCH_ID = 'your-actual-branch-id-here';
  
  this.API_BASE_URL = 'https://api.neon.tech/v1';
  this.isConnected = false;
  this.client = null;
}
```

## 📊 **مثال تنظیمات:**

```javascript
// مثال تنظیمات واقعی
this.NEON_API_KEY = 'neon_abc123def456ghi789';
this.PROJECT_ID = 'ep-calm-leaf-aehi0krv';
this.BRANCH_ID = 'main';
```

## 🎯 **نتیجه:**

بعد از تنظیم API credentials:
- ✅ **اتصال مستقیم** به Neon Console
- ✅ **ذخیره مستقیم** در دیتابیس Neon
- ✅ **بدون localStorage** fallback
- ✅ **عملکرد کامل** سیستم

## 🚨 **نکات مهم:**

1. **امنیت**: API Key را محرمانه نگه دارید
2. **تست**: بعد از تنظیم، صفحه را refresh کنید
3. **بررسی**: در console بررسی کنید که اتصال برقرار شده

## 📞 **پشتیبانی:**

اگر مشکلی داشتید:
1. API Key را دوباره بررسی کنید
2. Project ID را بررسی کنید
3. Branch ID را بررسی کنید
4. Console را برای خطاها بررسی کنید

