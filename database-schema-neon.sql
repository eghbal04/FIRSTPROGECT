-- Neon Database Schema for Price Data
-- این فایل برای ایجاد جداول مورد نیاز در دیتابیس Neon استفاده می‌شود

-- جدول قیمت‌های توکن
CREATE TABLE IF NOT EXISTS token_prices (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL,
    name VARCHAR(100) NOT NULL,
    price_usd TEXT NOT NULL, -- استفاده از TEXT برای اعداد بسیار کوچک
    price_dai TEXT NOT NULL,
    market_cap TEXT NOT NULL,
    total_supply TEXT NOT NULL,
    decimals INTEGER NOT NULL,
    source VARCHAR(50) DEFAULT 'contract',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول قیمت‌های پوینت
CREATE TABLE IF NOT EXISTS point_prices (
    id SERIAL PRIMARY KEY,
    point_type VARCHAR(50) NOT NULL,
    point_value_usd TEXT NOT NULL,
    point_value_iam TEXT NOT NULL,
    source VARCHAR(50) DEFAULT 'contract',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ایندکس‌ها برای بهبود عملکرد
CREATE INDEX IF NOT EXISTS idx_token_prices_symbol_created ON token_prices(symbol, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_prices_created_at ON token_prices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_point_prices_type_created ON point_prices(point_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_point_prices_created_at ON point_prices(created_at DESC);

-- تابع برای به‌روزرسانی خودکار updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- تریگر برای به‌روزرسانی خودکار updated_at در جدول token_prices
CREATE TRIGGER update_token_prices_updated_at 
    BEFORE UPDATE ON token_prices 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- تریگر برای به‌روزرسانی خودکار updated_at در جدول point_prices
CREATE TRIGGER update_point_prices_updated_at 
    BEFORE UPDATE ON point_prices 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ایجاد view برای آمار کلی
CREATE OR REPLACE VIEW price_stats AS
SELECT 
    'token' as asset_type,
    symbol as asset_name,
    COUNT(*) as total_records,
    MIN(created_at) as first_record,
    MAX(created_at) as last_record,
    AVG(price_usd::numeric) as avg_price_usd,
    MIN(price_usd::numeric) as min_price_usd,
    MAX(price_usd::numeric) as max_price_usd
FROM token_prices 
GROUP BY symbol
UNION ALL
SELECT 
    'point' as asset_type,
    point_type as asset_name,
    COUNT(*) as total_records,
    MIN(created_at) as first_record,
    MAX(created_at) as last_record,
    AVG(point_value_usd::numeric) as avg_price_usd,
    MIN(point_value_usd::numeric) as min_price_usd,
    MAX(point_value_usd::numeric) as max_price_usd
FROM point_prices 
GROUP BY point_type;

-- ایجاد view برای آخرین قیمت‌ها
CREATE OR REPLACE VIEW latest_prices AS
SELECT 
    'token' as asset_type,
    symbol as asset_name,
    price_usd,
    price_dai,
    market_cap,
    total_supply,
    decimals,
    source,
    created_at
FROM token_prices t1
WHERE t1.created_at = (
    SELECT MAX(t2.created_at) 
    FROM token_prices t2 
    WHERE t2.symbol = t1.symbol
)
UNION ALL
SELECT 
    'point' as asset_type,
    point_type as asset_name,
    point_value_usd as price_usd,
    point_value_usd as price_dai,
    NULL as market_cap,
    NULL as total_supply,
    NULL as decimals,
    source,
    created_at
FROM point_prices p1
WHERE p1.created_at = (
    SELECT MAX(p2.created_at) 
    FROM point_prices p2 
    WHERE p2.point_type = p1.point_type
);

-- ایجاد view برای تاریخچه قیمت‌ها (آخرین 24 ساعت)
CREATE OR REPLACE VIEW recent_price_history AS
SELECT 
    'token' as asset_type,
    symbol as asset_name,
    price_usd,
    created_at
FROM token_prices 
WHERE created_at >= NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 
    'point' as asset_type,
    point_type as asset_name,
    point_value_usd as price_usd,
    created_at
FROM point_prices 
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- اضافه کردن کامنت‌ها
COMMENT ON TABLE token_prices IS 'جدول ذخیره قیمت‌های توکن‌ها';
COMMENT ON TABLE point_prices IS 'جدول ذخیره قیمت‌های پوینت‌ها';
COMMENT ON COLUMN token_prices.price_usd IS 'قیمت توکن به دلار (به صورت متن برای اعداد بسیار کوچک)';
COMMENT ON COLUMN point_prices.point_value_usd IS 'ارزش پوینت به دلار';
COMMENT ON COLUMN point_prices.point_value_iam IS 'ارزش پوینت به IAM';

-- نمایش اطلاعات جداول
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('token_prices', 'point_prices')
ORDER BY table_name, ordinal_position;
