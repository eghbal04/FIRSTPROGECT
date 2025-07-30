# سیستم پروفایل کاربران - CPA Forex

## 📋 خلاصه
سیستم پروفایل کاربران امکان ایجاد و مدیریت صفحات شخصی برای هر کاربر را فراهم می‌کند. این سیستم شامل مدیریت اطلاعات شخصی، آمار خرید، لینک‌های اجتماعی و تاریخچه معاملات است.

## 🗂️ ساختار فایل‌ها

### فایل‌های اصلی:
- **`js/user-profile-manager.js`** - کلاس اصلی مدیریت پروفایل‌ها
- **`user-profile-sample.html`** - نمونه صفحه پروفایل کاربر
- **`USER_PROFILES_README.md`** - مستندات سیستم

### فایل‌های مرتبط:
- **`js/products-manager.js`** - مدیریت محصولات (با لینک‌های پروفایل)
- **`js/navbar.js`** - ناوبار (با دسترسی به پروفایل‌ها)

## 🚀 ویژگی‌ها

### 1. **مدیریت پروفایل**
- ایجاد پروفایل خودکار برای کاربران جدید
- ویرایش اطلاعات شخصی (نام، بیو، آواتار)
- مدیریت لینک‌های اجتماعی
- آپدیت آمار و اطلاعات

### 2. **نمایش اطلاعات**
- **آواتار و اطلاعات شخصی**
- **آمار کاربر:**
  - تعداد خریدها
  - مجموع هزینه‌ها
  - تعداد نظرات
  - روزهای عضویت
- **لینک‌های اجتماعی** (تلگرام، توییتر، ایمیل و...)
- **تاریخچه خرید** با جزئیات کامل

### 3. **تعامل با سیستم محصولات**
- لینک مستقیم به پروفایل فروشنده از کارت محصول
- نمایش آمار فروش در پروفایل فروشندگان
- ثبت خودکار تراکنش‌ها در تاریخچه

## 💾 ذخیره‌سازی داده‌ها

### localStorage Keys:
```javascript
// پروفایل‌های کاربران
'cpa_user_profiles' = {
    "0x1234...": {
        address: "0x1234...",
        name: "نام کاربر",
        bio: "توضیحات کاربر",
        avatar: "👤",
        joinDate: "2024-01-01T00:00:00.000Z",
        socialLinks: {
            telegram: "https://t.me/user",
            twitter: "https://twitter.com/user",
            email: "user@example.com"
        },
        stats: {
            totalPurchases: 15,
            totalSpent: 2500,
            favoriteProducts: [],
            reviews: [],
            purchases: [
                {
                    productName: "دوره آموزشی",
                    amount: 500,
                    date: "2024-01-15T00:00:00.000Z"
                }
            ]
        }
    }
}

// صفحات پروفایل (برای فایل‌های داینامیک)
'profile_page_0x1234...' = "HTML content of profile page"
```

## 🔧 API توابع

### توابع عمومی:
```javascript
// باز کردن پروفایل کاربر
openUserProfile(address)

// ایجاد پروفایل جدید
createUserProfile(address, data)

// آپدیت پروفایل
updateUserProfile(address, updates)
```

### متدهای کلاس UserProfileManager:
```javascript
// بارگذاری پروفایل‌ها
loadUserProfiles()

// ذخیره پروفایل‌ها
saveUserProfiles()

// دریافت پروفایل کاربر
getUserProfile(address)

// ایجاد صفحه HTML پروفایل
createProfilePage(address)

// تولید فایل‌های پروفایل
generateProfileFiles()
```

## 🎨 طراحی و UI

### رنگ‌بندی:
- **پس‌زمینه هدر:** گرادیان آبی-بنفش
- **کارت‌های آمار:** سفید با سایه
- **لینک‌های اجتماعی:** خاکستری روشن
- **دکمه‌ها:** آبی (#1976d2)

### Responsive Design:
- **دسکتاپ:** 2 ستونه برای بخش‌ها
- **موبایل:** 1 ستونه
- **آواتار:** 120px در دسکتاپ، کوچکتر در موبایل

## 🔗 یکپارچه‌سازی

### با سیستم محصولات:
```javascript
// در کارت محصول
<div class="product-seller">
    فروشنده: ${product.sellerName}
    <a href="#" class="profile-link" data-address="${product.seller}" 
       onclick="openUserProfile('${product.seller}')">👤 پروفایل</a>
</div>
```

### با ناوبار:
- لینک مستقیم به پروفایل کاربر
- دسترسی سریع به پروفایل‌های دیگر

## 📱 استفاده

### 1. **باز کردن پروفایل:**
```javascript
// از طریق لینک در محصولات
openUserProfile('0x1234...')

// یا مستقیماً
userProfileManager.openUserProfile('0x1234...')
```

### 2. **ایجاد پروفایل جدید:**
```javascript
createUserProfile('0x1234...', {
    name: 'نام کاربر',
    bio: 'توضیحات کاربر',
    avatar: '👤',
    socialLinks: {
        telegram: 'https://t.me/user',
        email: 'user@example.com'
    }
})
```

### 3. **آپدیت پروفایل:**
```javascript
updateUserProfile('0x1234...', {
    name: 'نام جدید',
    bio: 'توضیحات جدید',
    'stats.totalPurchases': 20
})
```

## 🔮 توسعه‌های آینده

### قابلیت‌های پیشنهادی:
1. **فرم ویرایش پروفایل** با UI زیبا
2. **آپلود آواتار** با پشتیبانی از تصاویر
3. **سیستم امتیازدهی** و نظرات
4. **پروفایل‌های عمومی/خصوصی**
5. **دنبال کردن کاربران**
6. **اعلان‌ها** برای آپدیت‌های پروفایل
7. **سیستم تگ‌ها** برای دسته‌بندی کاربران
8. **گزارش‌های پیشرفته** و نمودارها

### بهبودهای فنی:
1. **ذخیره‌سازی در سرور** به جای localStorage
2. **سیستم کش** برای بهبود عملکرد
3. **API RESTful** برای مدیریت پروفایل‌ها
4. **سیستم امنیت** و احراز هویت
5. **Backup و Sync** داده‌ها

## 🛠️ عیب‌یابی

### مشکلات رایج:

#### 1. **پروفایل نمایش داده نمی‌شود:**
```javascript
// بررسی وجود پروفایل
console.log(userProfileManager.getUserProfile(address))

// بررسی localStorage
console.log(localStorage.getItem('cpa_user_profiles'))
```

#### 2. **لینک‌های پروفایل کار نمی‌کنند:**
```javascript
// بررسی تابع openUserProfile
console.log(typeof window.openUserProfile)

// بررسی event listener
document.addEventListener('click', (e) => {
    if (e.target.matches('.profile-link')) {
        console.log('Profile link clicked:', e.target.dataset.address)
    }
})
```

#### 3. **داده‌ها ذخیره نمی‌شوند:**
```javascript
// بررسی localStorage
console.log('Available space:', navigator.storage.estimate())

// تست ذخیره‌سازی
try {
    localStorage.setItem('test', 'data')
    console.log('Storage works')
} catch (e) {
    console.error('Storage error:', e)
}
```

## 📞 پشتیبانی

برای سوالات و مشکلات:
1. بررسی console برای خطاها
2. بررسی localStorage برای داده‌ها
3. تست توابع API
4. بررسی یکپارچه‌سازی با سیستم‌های دیگر

---

**توسعه‌دهنده:** CPA Forex Team  
**آخرین به‌روزرسانی:** 1402/12/15  
**نسخه:** 1.0.0 