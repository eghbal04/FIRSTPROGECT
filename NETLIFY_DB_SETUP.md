# راهنمای راه‌اندازی Netlify Database

## 🚀 **مراحل راه‌اندازی:**

### **1. ورود به Netlify:**
```bash
npx netlify login
```

### **2. اتصال پروژه:**
```bash
npx netlify link
```
- گزینه اول را انتخاب کنید: "Use current git remote origin"
- پروژه مورد نظر را انتخاب کنید

### **3. راه‌اندازی دیتابیس:**
```bash
npx netlify db init
```
- "Y" را انتخاب کنید برای Drizzle boilerplate

### **4. ایجاد جداول:**
```bash
npx netlify db push
```

## 🔧 **تنظیمات پروژه:**

### **فایل `netlify.toml`:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[functions]
  directory = "netlify/functions"

[[plugins]]
  package = "@netlify/plugin-drizzle"
```

### **فایل `package.json`:**
```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:migrate": "drizzle-kit migrate"
  },
  "devDependencies": {
    "@netlify/plugin-drizzle": "^1.0.0",
    "drizzle-kit": "^0.20.0"
  }
}
```

## 📊 **مثال Schema:**

### **فایل `drizzle/schema.ts`:**
```typescript
import { pgTable, serial, varchar, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const tokenPrices = pgTable('token_prices', {
  id: serial('id').primaryKey(),
  symbol: varchar('symbol', { length: 10 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  priceUsd: text('price_usd').notNull(),
  priceDai: text('price_dai').notNull(),
  marketCap: text('market_cap').notNull(),
  totalSupply: text('total_supply').notNull(),
  decimals: integer('decimals').notNull(),
  source: varchar('source', { length: 50 }).default('direct'),
  createdAt: timestamp('created_at').defaultNow()
});

export const pointPrices = pgTable('point_prices', {
  id: serial('id').primaryKey(),
  pointType: varchar('point_type', { length: 50 }).notNull(),
  pointValueUsd: text('point_value_usd').notNull(),
  pointValueIam: text('point_value_iam').notNull(),
  source: varchar('source', { length: 50 }).default('direct'),
  createdAt: timestamp('created_at').defaultNow()
});
```

## 🎯 **مزایای Netlify Database:**

### ✅ **مزایا:**
1. **یکپارچگی**: با Netlify Functions یکپارچه
2. **سادگی**: بدون نیاز به تنظیمات پیچیده
3. **مقیاس‌پذیری**: خودکار scaling
4. **امنیت**: دسترسی محدود و امن

### 🔧 **نحوه استفاده:**

#### **در Netlify Functions:**
```typescript
import { db } from './db';
import { tokenPrices } from './schema';

export const handler = async (event, context) => {
  const newPrice = await db.insert(tokenPrices).values({
    symbol: 'IAM',
    name: 'IAM Token',
    priceUsd: '1.32e-15',
    priceDai: '1.32e-15',
    marketCap: '6915.28',
    totalSupply: '1000000000',
    decimals: 18,
    source: 'blockchain'
  });
  
  return {
    statusCode: 200,
    body: JSON.stringify(newPrice)
  };
};
```

#### **در Frontend:**
```javascript
// ذخیره قیمت
const response = await fetch('/.netlify/functions/save-token-price', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(tokenData)
});

// دریافت قیمت
const response = await fetch('/.netlify/functions/get-token-price');
const data = await response.json();
```

## 🚨 **نکات مهم:**

1. **Environment Variables**: در Netlify Dashboard تنظیم کنید
2. **CORS**: برای درخواست‌های cross-origin تنظیم کنید
3. **Rate Limiting**: محدودیت درخواست‌ها را در نظر بگیرید

## 📞 **پشتیبانی:**

اگر مشکلی داشتید:
1. `netlify status` را اجرا کنید
2. Console را برای خطاها بررسی کنید
3. Netlify Dashboard را بررسی کنید

