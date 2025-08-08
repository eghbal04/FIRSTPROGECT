# خلاصه تغییر از DAI به USDC

## 🔄 تغییرات انجام شده

### آدرس‌ها:
- ❌ **DAI**: `0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063`
- ✅ **USDC**: `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`

### دسیمال‌ها:
- ❌ **DAI**: 18 دسیمال
- ✅ **USDC**: 6 دسیمال

## 📁 فایل‌های تغییر یافته:

### 1. **js/config.js**
- آدرس DAI → USDC
- دسیمال 18 → 6
- متن‌های نمایشی DAI → USDC
- تابع `getContractUSDCBalance()` اضافه شده
- Backward compatibility حفظ شده

### 2. **js/central-dashboard-updater.js**
- بروزرسانی logicهای دریافت موجودی
- support برای USDC_ADDRESS
- دسیمال 6 برای format کردن

### 3. **js/main.js**
- آدرس‌های DAI → USDC
- دسیمال‌های 18 → 6
- متن‌های نمایشی

### 4. **js/homepage.js**
- fallback روی USDC contract
- دسیمال 6 برای format

### 5. **js/token-balances.js**
- آدرس و دسیمال USDC

### 6. **js/mobile-user-popup.js**
- آدرس USDC
- دسیمال 6

### 7. **js/dai-balance-debugger.js**
- support برای USDC
- debug tools بروزرسانی شده

### 8. **HTML Files**
- `index.html`: متن "موجودی DAI" → "موجودی USDC"
- `wallet-dashboard.html`: logic و متن‌های USDC

## 🔧 Backward Compatibility

برای اطمینان از عدم خرابی کد موجود:
- `window.DAI_ADDRESS` همچنان موجود است و به USDC اشاره می‌کند
- تمام توابع قدیمی کار می‌کنند
- Variable names داخلی همچنان `daiBalance` است (برای سادگی)

## 🧪 تست

برای تست تغییرات:
```javascript
// در کنسول مرورگر
console.log('USDC_ADDRESS:', window.USDC_ADDRESS);
console.log('DAI_ADDRESS (compatibility):', window.DAI_ADDRESS);

// تست موجودی
debugDAIBalance() // همچنان کار می‌کند
quickDAICheck()   // حالا USDC را نمایش می‌دهد
```

## ✅ تایید تغییرات

- ✅ تمام آدرس‌های DAI با USDC جایگزین شدند
- ✅ تمام دسیمال‌ها از 18 به 6 تغییر کردند  
- ✅ متن‌های نمایشی بروزرسانی شدند
- ✅ Backward compatibility حفظ شد
- ✅ سیستم مرکزی بروزرسانی شد

---

**حالا کل پروژه از USDC استفاده می‌کند بجای DAI!** 🎯