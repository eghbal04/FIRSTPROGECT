# راهنمای اتصال به دیتابیس Neon

این راهنما نحوه اتصال و استفاده از دیتابیس Neon برای ذخیره و دریافت تاریخچه قیمت‌ها را توضیح می‌دهد.

## 🚀 مراحل راه‌اندازی

### 1. نصب وابستگی‌ها

```bash
cd api
npm install
```

### 2. تنظیم متغیرهای محیطی

فایل `api/env-example.txt` را کپی کرده و به `.env` تغییر نام دهید:

```bash
cp env-example.txt .env
```

سپس مقادیر را در فایل `.env` تنظیم کنید:

```env
DATABASE_URL=postgresql://neondb_owner:npg_4dRPEJOfq5Mj@ep-calm-leaf-aehi0krv-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
PORT=3000
API_KEY=your-secret-api-key-here
```

### 3. ایجاد جداول دیتابیس

فایل `database-schema-neon.sql` را در دیتابیس Neon اجرا کنید:

```sql
-- اجرای فایل SQL در دیتابیس Neon
-- این فایل جداول token_prices و point_prices را ایجاد می‌کند
```

### 4. راه‌اندازی API سرور

```bash
# حالت توسعه
npm run dev

# حالت تولید
npm start
```

### 5. تست اتصال

```bash
curl http://localhost:3000/api/health
```

## 📊 ساختار دیتابیس

### جدول token_prices
- `id`: شناسه یکتا
- `symbol`: نماد توکن (IAM)
- `name`: نام توکن
- `price_usd`: قیمت به دلار
- `price_dai`: قیمت به DAI
- `market_cap`: ارزش بازار
- `total_supply`: عرضه کل
- `decimals`: تعداد اعشار
- `source`: منبع داده (contract/mock)
- `created_at`: زمان ایجاد
- `updated_at`: زمان به‌روزرسانی

### جدول point_prices
- `id`: شناسه یکتا
- `point_type`: نوع پوینت (binary_points, referral_points, monthly_points)
- `point_value_usd`: ارزش پوینت به دلار
- `point_value_iam`: ارزش پوینت به IAM
- `source`: منبع داده
- `created_at`: زمان ایجاد
- `updated_at`: زمان به‌روزرسانی

## 🔌 API Endpoints

### Health Check
```
GET /api/health
```

### ذخیره قیمت توکن
```
POST /api/prices/token
Content-Type: application/json

{
  "symbol": "IAM",
  "name": "IAM Token",
  "price_usd": "1.283e-15",
  "price_dai": "1.283e-15",
  "market_cap": "1234567.89",
  "total_supply": "1000000000.000000000000000000",
  "decimals": "18",
  "source": "contract"
}
```

### ذخیره قیمت پوینت
```
POST /api/prices/point
Content-Type: application/json

{
  "point_type": "binary_points",
  "point_value_usd": "15.63",
  "point_value_iam": "0.1",
  "source": "contract"
}
```

### دریافت آخرین قیمت توکن
```
GET /api/prices/token/IAM/latest
```

### دریافت آخرین قیمت پوینت
```
GET /api/prices/point/binary_points/latest
```

### دریافت تاریخچه قیمت توکن
```
GET /api/prices/token/IAM/history?hours=24
```

### دریافت تاریخچه قیمت پوینت
```
GET /api/prices/point/binary_points/history?hours=24
```

### دریافت آمار کلی
```
GET /api/prices/stats
```

### پاک‌سازی داده‌های قدیمی
```
DELETE /api/prices/cleanup
```

## 🔧 تنظیمات Frontend

### 1. به‌روزرسانی NeonApiService

در فایل `js/neon-api-service.js`، آدرس API خود را تنظیم کنید:

```javascript
constructor() {
  this.baseUrl = 'https://your-api-domain.com/api'; // آدرس API خود
  this.apiKey = 'your-api-key'; // کلید API خود
}
```

### 2. اضافه کردن اسکریپت به HTML

```html
<script src="js/neon-api-service.js"></script>
<script src="browser-price-service.js"></script>
```

## 🚀 استقرار (Deployment)

### 1. Vercel
```bash
# نصب Vercel CLI
npm i -g vercel

# استقرار
cd api
vercel
```

### 2. Heroku
```bash
# نصب Heroku CLI
# ایجاد اپلیکیشن
heroku create your-app-name

# تنظیم متغیرهای محیطی
heroku config:set DATABASE_URL=your-neon-database-url
heroku config:set API_KEY=your-secret-key

# استقرار
git push heroku main
```

### 3. Railway
```bash
# نصب Railway CLI
npm install -g @railway/cli

# ورود و استقرار
railway login
railway init
railway up
```

## 📈 مزایای استفاده از دیتابیس Neon

1. **مقیاس‌پذیری**: پشتیبانی از میلیون‌ها رکورد
2. **سرعت**: دسترسی سریع به داده‌ها
3. **قابلیت اطمینان**: پشتیبان‌گیری خودکار
4. **امنیت**: رمزگذاری داده‌ها
5. **تحلیل**: امکان اجرای کوئری‌های پیچیده

## 🔍 نظارت و دیباگ

### لاگ‌های سرور
```bash
# مشاهده لاگ‌ها
npm run dev

# یا در حالت تولید
npm start
```

### بررسی دیتابیس
```sql
-- مشاهده آخرین قیمت‌ها
SELECT * FROM latest_prices;

-- مشاهده آمار کلی
SELECT * FROM price_stats;

-- مشاهده تاریخچه اخیر
SELECT * FROM recent_price_history;
```

## ⚠️ نکات مهم

1. **امنیت**: کلید API را محرمانه نگه دارید
2. **محدودیت‌ها**: از rate limiting استفاده کنید
3. **پشتیبان‌گیری**: به‌طور منظم از دیتابیس پشتیبان بگیرید
4. **نظارت**: عملکرد API را نظارت کنید
5. **بهینه‌سازی**: ایندکس‌ها را به‌روزرسانی کنید

## 🆘 عیب‌یابی

### مشکل اتصال به دیتابیس
```bash
# تست اتصال
psql "postgresql://neondb_owner:npg_4dRPEJOfq5Mj@ep-calm-leaf-aehi0krv-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### مشکل CORS
```javascript
// در فایل price-api.js
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-domain.com']
}));
```

### مشکل SSL
```javascript
// در فایل price-api.js
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
```

## 📞 پشتیبانی

برای سوالات و مشکلات:
- GitHub Issues
- Email: your-email@domain.com
- Discord: your-discord-server
