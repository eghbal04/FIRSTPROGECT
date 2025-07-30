# راهنمای چارت‌های قیمت توکن و پوینت

## 🎯 **هدف**

چارت‌های قیمت توکن CPA و پوینت حالا از **داده‌های واقعی Smart Contract** استفاده می‌کنند و به‌روزرسانی خودکار دارند.

## 📊 **ویژگی‌های چارت‌ها**

### **💲 چارت قیمت توکن CPA**
- **منبع داده**: `contract.getTokenPrice()`
- **واحد**: DAI
- **به‌روزرسانی**: هر 30 ثانیه
- **رنگ**: سبز (#00ff88)

### **💎 چارت قیمت پوینت**
- **منبع داده**: `contract.getPointValue()`
- **واحد**: CPA
- **به‌روزرسانی**: هر 30 ثانیه
- **رنگ**: بنفش (#a786ff)

## 🔧 **مدیریت چارت‌ها**

### **مدیر چارت‌های قیمت**
```javascript
// دسترسی به مدیر چارت‌ها
window.priceChartsManager
```

### **دستورات مفید در کنسول**

#### **به‌روزرسانی دستی**
```javascript
window.updatePrices()
```

#### **نمایش آمار**
```javascript
window.showPriceStats()
```

#### **تنظیم فرکانس به‌روزرسانی**
```javascript
// هر 60 ثانیه
window.setUpdateFrequency(60)

// هر 10 ثانیه
window.setUpdateFrequency(10)
```

#### **توقف/شروع به‌روزرسانی خودکار**
```javascript
// توقف
window.stopAutoUpdate()

// شروع مجدد
window.startAutoUpdate()
```

#### **پاک کردن تاریخچه**
```javascript
window.clearPriceHistory()
```

#### **صادر کردن داده‌ها**
```javascript
window.exportPriceData()
```

## 📈 **دوره‌های زمانی**

### **روزانه (24 ساعت)**
- 24 نقطه داده
- فواصل 1 ساعته
- نمایش ساعت‌ها

### **هفتگی (7 روز)**
- 7 نقطه داده
- فواصل روزانه
- نمایش روزهای هفته

### **ماهانه (30 روز)**
- 30 نقطه داده
- فواصل روزانه
- نمایش روزهای ماه

### **سالانه (12 ماه)**
- 12 نقطه داده
- فواصل ماهانه
- نمایش ماه‌های سال

## 🔄 **فرآیند به‌روزرسانی**

### **1. اتصال به قرارداد**
```javascript
if (!window.contractConfig || !window.contractConfig.contract) {
    console.log('⏳ منتظر اتصال به قرارداد...');
    return;
}
```

### **2. دریافت قیمت‌ها**
```javascript
// قیمت توکن
const tokenPrice = await contract.getTokenPrice();
const tokenPriceNum = parseFloat(ethers.formatUnits(tokenPrice, 18));

// قیمت پوینت
const pointValue = await contract.getPointValue();
const pointValueNum = parseFloat(ethers.formatUnits(pointValue, 18));
```

### **3. ذخیره در تاریخچه**
```javascript
// اضافه کردن به تاریخچه
await window.priceHistoryManager.addTokenPrice(tokenPriceNum);
await window.priceHistoryManager.addPointPrice(pointValueNum);
```

### **4. به‌روزرسانی چارت‌ها**
```javascript
// به‌روزرسانی داده‌های چارت
this.generateTimePeriodData();
```

## 📊 **نمایش آمار**

### **آمار قیمت توکن**
```
💲 === آمار قیمت توکن ===
📈 تعداد داده‌ها: 24
📉 حداقل قیمت: 0.000123 DAI
📈 حداکثر قیمت: 0.000456 DAI
📊 میانگین قیمت: 0.000234 DAI
💰 قیمت فعلی: 0.000345 DAI
```

### **آمار قیمت پوینت**
```
💎 === آمار قیمت پوینت ===
📈 تعداد داده‌ها: 24
📉 حداقل قیمت: 1.234567 CPA
📈 حداکثر قیمت: 1.456789 CPA
📊 میانگین قیمت: 1.345678 CPA
💰 قیمت فعلی: 1.345678 CPA
```

## 💾 **ذخیره‌سازی داده‌ها**

### **localStorage**
- تاریخچه قیمت توکن: `tokenPriceHistory`
- تاریخچه قیمت پوینت: `pointPriceHistory`
- نتایج آپلود Cloudinary: `cloudinaryUploadResults`

### **فرمت داده‌ها**
```javascript
{
    timestamp: 1640995200000,
    price: 0.000123,
    time: "2022-01-01T00:00:00.000Z"
}
```

## 🎨 **تنظیمات ظاهری**

### **چارت قیمت توکن**
```javascript
{
    borderColor: '#00ff88',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    pointBackgroundColor: '#00ff88',
    pointBorderColor: '#fff'
}
```

### **چارت قیمت پوینت**
```javascript
{
    borderColor: '#a786ff',
    backgroundColor: 'rgba(167, 134, 255, 0.1)',
    pointBackgroundColor: '#a786ff',
    pointBorderColor: '#fff'
}
```

## 🔧 **عیب‌یابی**

### **مشکلات رایج**

#### **1. عدم اتصال به قرارداد**
```
⏳ منتظر اتصال به قرارداد...
```
**راه حل**: اطمینان از اتصال کیف پول

#### **2. خطا در دریافت قیمت**
```
❌ خطا در دریافت قیمت توکن: Error
```
**راه حل**: بررسی اتصال شبکه و قرارداد

#### **3. عدم نمایش چارت**
```
⏳ منتظر بارگذاری Chart.js...
```
**راه حل**: بررسی بارگذاری Chart.js

### **لاگ‌های مفید**
```javascript
// فعال کردن لاگ‌های مفصل
console.log('🔍 فعال کردن لاگ‌های مفصل...');

// بررسی وضعیت چارت‌ها
console.log('📊 وضعیت چارت‌ها:', {
    tokenChart: !!window.priceChartsManager.tokenChart,
    pointChart: !!window.priceChartsManager.pointChart,
    isInitialized: window.priceChartsManager.isInitialized
});
```

## 📱 **بهینه‌سازی موبایل**

### **ریسپانسیو**
- چارت‌ها در موبایل کوچک‌تر می‌شوند
- نمایش بهینه برای صفحات کوچک
- لودینگ سریع‌تر

### **عملکرد**
- به‌روزرسانی هوشمند (فقط در صورت فعال بودن صفحه)
- کش داده‌ها در localStorage
- کاهش درخواست‌های غیرضروری

## 🚀 **ویژگی‌های آینده**

### **در حال توسعه**
- [ ] نمودارهای مقایسه‌ای
- [ ] هشدارهای قیمت
- [ ] تحلیل تکنیکال
- [ ] صادر کردن به Excel
- [ ] نمودارهای تعاملی

### **درخواست‌های کاربران**
- [ ] دوره‌های زمانی سفارشی
- [ ] فیلترهای پیشرفته
- [ ] نمودارهای چندگانه
- [ ] اعلان‌های قیمت

## 📞 **پشتیبانی**

### **مشکلات فنی**
- بررسی کنسول مرورگر برای خطاها
- بررسی اتصال شبکه
- بررسی اتصال کیف پول

### **تماس**
- گزارش باگ‌ها در GitHub
- درخواست ویژگی‌های جدید
- سوالات فنی

---

**نکته**: چارت‌های قیمت حالا کاملاً از داده‌های واقعی Smart Contract استفاده می‌کنند و هیچ داده جعلی یا شبیه‌سازی شده‌ای نمایش داده نمی‌شود. 🎯 