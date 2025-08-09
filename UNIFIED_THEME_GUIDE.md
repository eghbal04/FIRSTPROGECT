# 🎨 راهنمای تم یکپارچه CPA Forex

## 📋 خلاصه
تم یکپارچه و مدرن برای تمام صفحات و کامپوننت‌های پروژه CPA Forex که تجربه کاربری یکسان و حرفه‌ای ایجاد می‌کند.

## 🎯 ویژگی‌ها

### ✅ **کاملاً یکپارچه:**
- **33 صفحه HTML** با تم یکسان
- **متغیرهای CSS** برای رنگ‌ها، فونت‌ها و فاصله‌ها
- **کامپوننت‌های آماده** (دکمه، کارت، مودال، ...)
- **ریسپانسیو** برای همه دستگاه‌ها

### 🌈 **پالت رنگی:**
- **اصلی:** `#a786ff` (بنفش)
- **ثانویه:** `#00ff88` (سبز)
- **تاکیدی:** `#ff6b9d` (صورتی)
- **خطا:** `#ff5252` (قرمز)
- **هشدار:** `#ffa726` (نارنجی)

### 📐 **متغیرهای طراحی:**
```css
--cpa-space-xs: 4px
--cpa-space-sm: 8px  
--cpa-space-md: 16px
--cpa-space-lg: 24px
--cpa-space-xl: 32px

--cpa-radius-sm: 8px
--cpa-radius-md: 12px
--cpa-radius-lg: 16px
--cpa-radius-xl: 20px
```

## 🛠️ فایل‌های تم

### 📄 **فایل‌های اصلی:**
- **`css/unified-theme.css`** - تم اصلی
- **`js/theme-variables.js`** - متغیرهای JavaScript

### 🔗 **اعمال شده در:**
- ✅ همه 33 صفحه HTML
- ✅ Sidebar و Toggle Button  
- ✅ مودال‌های احراز هویت
- ✅ پیام‌های خطا و هشدار

## 🎭 کلاس‌های آماده

### 🔘 **دکمه‌ها:**
```html
<button class="cpa-btn cpa-btn-primary">دکمه اصلی</button>
<button class="cpa-btn cpa-btn-secondary">دکمه ثانویه</button>
<button class="cpa-btn cpa-btn-outline">دکمه خالی</button>
<button class="cpa-btn cpa-btn-ghost">دکمه شفاف</button>

<!-- اندازه‌ها -->
<button class="cpa-btn cpa-btn-sm">کوچک</button>
<button class="cpa-btn cpa-btn-lg">بزرگ</button>
```

### 📄 **کارت‌ها:**
```html
<div class="cpa-card">
  <div class="cpa-card-header">
    <h3 class="cpa-heading-3">عنوان کارت</h3>
  </div>
  <div class="cpa-card-body">
    <p>محتوای کارت</p>
  </div>
  <div class="cpa-card-footer">
    <button class="cpa-btn cpa-btn-primary">عمل</button>
  </div>
</div>
```

### 🔤 **فیلدهای ورودی:**
```html
<label class="cpa-label">برچسب فیلد</label>
<input type="text" class="cpa-input" placeholder="متن راهنما">
```

### 📱 **مودال‌ها:**
```html
<div class="cpa-modal-backdrop active">
  <div class="cpa-modal">
    <div class="cpa-modal-header">
      <h2 class="cpa-modal-title">عنوان مودال</h2>
      <button class="cpa-modal-close">×</button>
    </div>
    <div class="cpa-modal-body">
      محتوای مودال
    </div>
    <div class="cpa-modal-footer">
      <button class="cpa-btn cpa-btn-primary">تایید</button>
      <button class="cpa-btn cpa-btn-outline">لغو</button>
    </div>
  </div>
</div>
```

## 📐 سیستم گرید و فلکس

### 🔢 **گرید:**
```html
<div class="cpa-grid cpa-grid-2">
  <div>ستون 1</div>
  <div>ستون 2</div>
</div>

<div class="cpa-grid cpa-grid-auto">
  <!-- کارت‌ها خودکار تنظیم می‌شوند -->
</div>
```

### 🔀 **فلکس:**
```html
<div class="cpa-flex cpa-flex-between">
  <span>راست</span>
  <span>چپ</span>
</div>

<div class="cpa-flex-center">
  <span>وسط</span>
</div>
```

## 🎨 متن و رنگ‌ها

### 📝 **اندازه متن:**
```html
<h1 class="cpa-heading-1">عنوان اصلی</h1>
<h2 class="cpa-heading-2">عنوان ثانویه</h2>
<p class="cpa-text-lg">متن بزرگ</p>
<p class="cpa-text-md">متن معمولی</p>
<p class="cpa-text-sm">متن کوچک</p>
```

### 🌈 **رنگ متن:**
```html
<span class="cpa-text-primary">متن اصلی</span>
<span class="cpa-text-secondary">متن ثانویه</span>
<span class="cpa-text-muted">متن خاکستری</span>
<span class="cpa-text-disabled">متن غیرفعال</span>
```

### 🎯 **تراز متن:**
```html
<p class="cpa-text-center">وسط‌چین</p>
<p class="cpa-text-left">چپ‌چین</p>
<p class="cpa-text-right">راست‌چین</p>
```

## 📏 فاصله‌دهی

### 📐 **حاشیه:**
```html
<div class="cpa-mb-xs">حاشیه پایین کوچک</div>
<div class="cpa-mb-sm">حاشیه پایین کوچک</div>
<div class="cpa-mb-md">حاشیه پایین متوسط</div>
<div class="cpa-mb-lg">حاشیه پایین بزرگ</div>
<div class="cpa-mb-xl">حاشیه پایین خیلی بزرگ</div>

<!-- همینطور برای mt (بالا) -->
<div class="cpa-mt-md">حاشیه بالا متوسط</div>
```

### 🗂️ **پدینگ:**
```html
<div class="cpa-p-xs">پدینگ کوچک</div>
<div class="cpa-p-sm">پدینگ کوچک</div>
<div class="cpa-p-md">پدینگ متوسط</div>
<div class="cpa-p-lg">پدینگ بزرگ</div>
<div class="cpa-p-xl">پدینگ خیلی بزرگ</div>
```

## 🚨 پیام‌ها و هشدارها

```html
<div class="cpa-alert cpa-alert-success">
  ✅ پیام موفقیت
</div>

<div class="cpa-alert cpa-alert-warning">
  ⚠️ پیام هشدار
</div>

<div class="cpa-alert cpa-alert-error">
  ❌ پیام خطا
</div>

<div class="cpa-alert cpa-alert-info">
  ℹ️ پیام اطلاعاتی
</div>
```

## 💻 استفاده در JavaScript

### 🎨 **متغیرهای تم:**
```javascript
// دریافت رنگ‌ها
const primaryColor = window.getCSSVariable('--cpa-primary');
const bgColor = window.getCSSVariable('--cpa-bg-primary');

// تنظیم رنگ جدید
window.setCSSVariable('--cpa-primary', '#ff0000');

// تغییر تم
window.applyTheme('dark'); // یا 'light'
const currentTheme = window.getCurrentTheme();
```

### 📊 **اطلاعات تم:**
```javascript
// دسترسی به اطلاعات کامل
console.log(window.CPA_THEME.colors.primary);
console.log(window.CPA_THEME.spacing.md);
console.log(window.CPA_THEME.radius.lg);
```

## 🎯 کلاس‌های کمکی

### 👁️ **نمایش/پنهان:**
```html
<div class="cpa-hidden">پنهان</div>
<div class="cpa-visible">نمایش</div>
<div class="cpa-invisible">نامرئی</div>
```

### 📐 **اندازه:**
```html
<div class="cpa-w-full">عرض کامل</div>
<div class="cpa-h-full">ارتفاع کامل</div>
```

### 🖱️ **کرسر:**
```html
<span class="cpa-cursor-pointer">کلیکی</span>
<span class="cpa-cursor-not-allowed">غیرقابل کلیک</span>
```

### 🎭 **انیمیشن:**
```html
<div class="cpa-animate-fadeIn">محو شدن</div>
<div class="cpa-animate-slideIn">لغزش</div>
<div class="cpa-animate-pulse">نبض</div>
```

## 📱 ریسپانسیو

تم به صورت خودکار با دستگاه‌های مختلف سازگار است:

```css
/* کامپیوتر: بدون تغییر */
.cpa-grid-3 { grid-template-columns: repeat(3, 1fr); }

/* موبایل: تک ستون */
@media (max-width: 768px) {
  .cpa-grid-3 { grid-template-columns: 1fr; }
}
```

## 🚀 بهترین روش‌ها

### ✅ **انجام دهید:**
- از کلاس‌های `cpa-` استفاده کنید
- متغیرهای CSS را برای رنگ‌ها بکار ببرید
- از سیستم گرید/فلکس استفاده کنید
- تست روی موبایل انجام دهید

### ❌ **انجام ندهید:**
- رنگ‌های سخت کد نکنید
- استایل‌های inline زیاد ننویسید
- از متغیرهای تم صرف نظر نکنید
- ریسپانسیو را فراموش نکنید

## 🎉 نتیجه

تم یکپارچه CPA Forex:
- ✅ **یکسان:** همه صفحات یک ظاهر دارند
- ✅ **مدرن:** طراحی روز و حرفه‌ای
- ✅ **انعطاف‌پذیر:** قابل تنظیم و توسعه
- ✅ **ریسپانسیو:** روی همه دستگاه‌ها کار می‌کند
- ✅ **کارآمد:** کدنویسی سریع‌تر و بهتر

**استفاده لذت‌بخش! 🎨✨**

