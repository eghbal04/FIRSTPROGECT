# دستورات کنسول برای مدیریت سیستم مرکزی

## 🎯 کنترل سیستم مرکزی

```javascript
// شروع سیستم مرکزی
startCentralUpdater()

// توقف سیستم مرکزی
stopCentralUpdater()

// مشاهده آمار سیستم
getCentralUpdaterStats()

// فعال کردن debug (نمایش تغییرات)
enableCentralDebug()

// غیرفعال کردن debug
disableCentralDebug()

// تست کامل سیستم
testCentralUpdater()

// پاک کردن حافظه مقادیر
resetCentralCache()
```

## 🧪 تست و Debug

```javascript
// تست سیستم با debug
enableCentralDebug()
testCentralUpdater()

// مشاهده آمار در حال اجرا
setInterval(() => {
    console.log(getCentralUpdaterStats())
}, 10000)

// چک دستی مقادیر
window.centralDashboardUpdater.checkAndUpdateValues()
```

## 📊 مثال خروجی Debug

```
[Central Updater] 🚀 شروع سیستم مرکزی بروزرسانی داشبورد...
[Central Updater] 🧹 حذف تمام interval های قدیمی...
[Central Updater] ❌ dashboardUpdateInterval حذف شد
[Central Updater] ✅ تمام interval های قدیمی حذف شدند
[Central Updater] ✅ سیستم مرکزی راه‌اندازی شد - هر 5 ثانیه
[Central Updater] 🔄 circulating-supply: undefined → 1,234,567 IAM
[Central Updater] 🔄 total-points: undefined → 89,123
[Central Updater] 🔄 dashboard-token-price: undefined → 0.000123
[Central Updater] 🔄 3 مقدار بروزرسانی شد
[Central Updater] ⚡ هیچ تغییری تشخیص داده نشد
```

استفاده کنید! 🚀