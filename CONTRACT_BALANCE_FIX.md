# 🔧 اصلاح مشکل موجودی CPA در قرارداد

## 🐛 مشکل یافت شده:
در `js/central-dashboard-updater.js` خط 146:
```javascript
// ❌ اشتباه - موجودی کاربر را می‌خواند
const contractBalance = await contract.balanceOf(window.contractConfig.address);
```

## ✅ راه‌حل:
```javascript
// ✅ درست - موجودی قرارداد را می‌خواند
const contractBalance = await contract.balanceOf(contract.target);
```

## 🔍 دلیل مشکل:
- `window.contractConfig.address` = آدرس کیف پول کاربر
- `contract.target` = آدرس قرارداد خودش

## 📊 تأثیر اصلاح:
- ابتدا موجودی کاربر نمایش داده می‌شد
- بعد توسط سیستم مرکزی به موجودی قرارداد تصحیح می‌شد
- حالا مستقیماً موجودی صحیح قرارداد نمایش داده می‌شود

## ✅ وضعیت:
مشکل برطرف شد - حالا موجودی CPA در قرارداد درست نمایش داده می‌شود.