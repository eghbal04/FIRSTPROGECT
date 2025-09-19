// اضافه کردن داده نمونه برای تست چارت
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fnxqtadklghdjvzqsqhk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZueHF0YWRrbGdoZGp2enFzcWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNzUwODQsImV4cCI6MjA3Mzg1MTA4NH0.pVyyCttoR1d7EI7UX0ro68sBn-d5s8h_55BPxPFI8Bw';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function addSampleData() {
  try {
    console.log('🔄 Adding sample data...');
    
    // داده‌های نمونه برای 24 ساعت گذشته
    const now = Math.floor(Date.now() / 1000);
    const oneDayAgo = now - (24 * 60 * 60);
    
    const sampleCandles = [];
    
    // ایجاد 1440 کندل 1 دقیقه‌ای (24 ساعت)
    for (let i = 0; i < 1440; i++) {
      const timestamp = oneDayAgo + (i * 60);
      const basePrice = 0.001 + (Math.random() - 0.5) * 0.0002; // قیمت بین 0.0009 تا 0.0011
      const volatility = 0.0001;
      
      const open = basePrice + (Math.random() - 0.5) * volatility;
      const close = open + (Math.random() - 0.5) * volatility;
      const high = Math.max(open, close) + Math.random() * volatility;
      const low = Math.min(open, close) - Math.random() * volatility;
      const volume = Math.random() * 10000 + 1000;
      
      sampleCandles.push({
        bucket_ts: timestamp,
        open: open.toFixed(6),
        high: high.toFixed(6),
        low: low.toFixed(6),
        close: close.toFixed(6),
        volume: volume.toFixed(2),
        trades_count: Math.floor(Math.random() * 50) + 1
      });
    }
    
    // اضافه کردن داده‌ها
    const { data, error } = await supabase
      .from('candles_1m')
      .insert(sampleCandles);
    
    if (error) {
      console.error('❌ Error adding sample data:', error.message);
    } else {
      console.log('✅ Sample data added successfully!');
      console.log(`📊 Added ${sampleCandles.length} candles`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addSampleData();
