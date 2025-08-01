// Price Charts Manager - مدیریت همزمان چارت‌های قیمت توکن و پوینت با Firebase
class PriceChartsManager {
    constructor() {
        this.tokenChart = null;
        this.pointChart = null;
        this.updateInterval = null;
        this.isInitialized = false;
        this.updateFrequency = 30000; // 30 ثانیه
        this.firebaseEnabled = false;
        
        this.init();
    }
    
    init() {
        // منتظر بارگذاری DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupCharts());
        } else {
            this.setupCharts();
        }
    }
    
    async setupCharts() {
        console.log('📊 راه‌اندازی مدیر چارت‌های قیمت...');
        
        // منتظر بارگذاری Chart.js
        if (typeof Chart === 'undefined') {
            console.log('⏳ منتظر بارگذاری Chart.js...');
            setTimeout(() => this.setupCharts(), 1000);
            return;
        }
        
        // منتظر آماده شدن PriceHistoryManager
        if (!window.priceHistoryManager) {
            console.log('⏳ منتظر آماده شدن PriceHistoryManager...');
            setTimeout(() => this.setupCharts(), 500);
            return;
        }
        
        // بررسی Firebase
        await this.checkFirebaseAvailability();
        
        // راه‌اندازی چارت‌ها
        this.initializeCharts();
        
        // شروع به‌روزرسانی‌ها
        this.startUpdates();
        
        this.isInitialized = true;
        console.log('✅ مدیر چارت‌های قیمت راه‌اندازی شد');
    }

    // بررسی دسترسی به Firebase
    async checkFirebaseAvailability() {
        if (window.firebasePriceHistory && window.firebasePriceHistory.get) {
            try {
                const stats = await window.firebasePriceHistory.getStats();
                if (stats !== null) {
                    this.firebaseEnabled = true;
                    console.log('✅ Firebase برای چارت‌های قیمت فعال شد');
                    
                    // بارگذاری داده‌های تاریخی از Firebase
                    await this.loadHistoricalDataFromFirebase();
                }
            } catch (error) {
                console.warn('⚠️ Firebase در دسترس نیست:', error);
                this.firebaseEnabled = false;
            }
        } else {
            console.log('ℹ️ Firebase در دسترس نیست، از localStorage استفاده می‌شود');
            this.firebaseEnabled = false;
        }
    }

    // بارگذاری داده‌های تاریخی از Firebase
    async loadHistoricalDataFromFirebase() {
        if (!this.firebaseEnabled || !window.firebasePriceHistory) {
            return;
        }

        try {
            console.log('📥 بارگذاری داده‌های تاریخی از Firebase...');
            const firebaseHistory = await window.firebasePriceHistory.get(1000);
            
            if (firebaseHistory && firebaseHistory.length > 0) {
                // به‌روزرسانی PriceHistoryManager با داده‌های Firebase
                if (window.priceHistoryManager) {
                    await window.priceHistoryManager.reloadFromFirebase();
                    console.log('✅ داده‌های تاریخی از Firebase بارگذاری شد');
                    
                    // دوباره راه‌اندازی چارت‌ها با داده‌های جدید
                    setTimeout(() => {
                        this.initializeCharts();
                        this.updateCharts();
                    }, 1000);
                }
            } else {
                console.log('ℹ️ هیچ داده‌ای در Firebase یافت نشد');
            }
        } catch (error) {
            console.error('❌ خطا در بارگذاری داده‌های تاریخی از Firebase:', error);
        }
    }
    
    initializeCharts() {
        // راه‌اندازی چارت قیمت توکن
        if (document.getElementById('price-chart-canvas')) {
            this.tokenChart = new PriceChart();
            console.log('✅ چارت قیمت توکن راه‌اندازی شد');
        }
        
        // راه‌اندازی چارت قیمت پوینت
        if (document.getElementById('point-chart-canvas')) {
            this.pointChart = new PointChart();
            console.log('✅ چارت قیمت پوینت راه‌اندازی شد');
        }
    }
    
    startUpdates() {
        // پاک کردن interval قبلی
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // شروع به‌روزرسانی همزمان
        this.updateInterval = setInterval(async () => {
            await this.updateAllPrices();
        }, this.updateFrequency);
        
        console.log(`🔄 به‌روزرسانی خودکار هر ${this.updateFrequency / 1000} ثانیه`);
    }
    
    async updateAllPrices() {
        try {
            if (!window.contractConfig || !window.contractConfig.contract) {
                console.log('⏳ منتظر اتصال به قرارداد...');
                return;
            }
            const contract = window.contractConfig.contract;
            console.log('🔄 به‌روزرسانی قیمت‌ها...');

            // دریافت همزمان هر دو قیمت
            const [tokenPriceRaw, pointValueRaw] = await Promise.all([
                contract.getTokenPrice(),
                contract.getPointValue()
            ]);
            const tokenPrice = parseFloat(ethers.formatUnits(tokenPriceRaw, 18));
            const pointValue = parseFloat(ethers.formatUnits(pointValueRaw, 18));
            console.log('✅ قیمت توکن دریافت شد:', tokenPrice);
            console.log('✅ قیمت پوینت دریافت شد:', pointValue);

            // ذخیره همزمان هر دو مقدار در Firebase
            if (this.firebaseEnabled && window.firebasePriceHistory && window.firebasePriceHistory.save) {
                try {
                    await window.firebasePriceHistory.save(tokenPrice, pointValue);
                    console.log('✅ قیمت‌ها در Firebase ذخیره شد');
                } catch (firebaseError) {
                    console.warn('⚠️ خطا در ذخیره Firebase:', firebaseError);
                }
            }

            // نمایش نتایج
            this.displayPrices(tokenPrice, pointValue);

            // به‌روزرسانی چارت‌ها
            this.updateCharts();

        } catch (error) {
            console.error('❌ خطا در به‌روزرسانی قیمت‌ها:', error);
        }
    }
    
    async updateTokenPrice(contract) {
        try {
            console.log('💲 دریافت قیمت توکن از قرارداد...');
            const tokenPrice = await contract.getTokenPrice();
            const tokenPriceNum = parseFloat(ethers.formatUnits(tokenPrice, 18));
            console.log('✅ قیمت توکن دریافت شد:', tokenPriceNum);
            return tokenPriceNum;
        } catch (error) {
            console.error('❌ خطا در دریافت قیمت توکن:', error);
            return null;
        }
    }
    
    async updatePointPrice(contract) {
        try {
            console.log('💎 دریافت قیمت پوینت از قرارداد...');
            const pointValue = await contract.getPointValue();
            const pointValueNum = parseFloat(ethers.formatUnits(pointValue, 18));
            console.log('✅ قیمت پوینت دریافت شد:', pointValueNum);
            return pointValueNum;
        } catch (error) {
            console.error('❌ خطا در دریافت قیمت پوینت:', error);
            return null;
        }
    }
    
    displayPrices(tokenPrice, pointValue) {
        // نمایش قیمت توکن
        const priceDisplay = document.getElementById('current-price-display');
        if (priceDisplay && tokenPrice !== null) {
            priceDisplay.textContent = window.priceHistoryManager ? 
                window.priceHistoryManager.formatPrice(tokenPrice) : 
                tokenPrice.toFixed(6);
        }
        
        // نمایش قیمت پوینت
        const pointDisplay = document.getElementById('current-point-display');
        if (pointDisplay && pointValue !== null) {
            pointDisplay.textContent = window.priceHistoryManager ? 
                window.priceHistoryManager.formatPrice(pointValue) : 
                pointValue.toFixed(6);
        }
    }
    
    updateCharts() {
        // به‌روزرسانی چارت توکن
        if (this.tokenChart) {
            this.tokenChart.generateTimePeriodData();
        }
        
        // به‌روزرسانی چارت پوینت
        if (this.pointChart) {
            this.pointChart.generateTimePeriodData();
        }
    }
    
    setUpdateFrequency(seconds) {
        this.updateFrequency = seconds * 1000;
        this.startUpdates();
        console.log(`⚙️ فرکانس به‌روزرسانی به ${seconds} ثانیه تغییر یافت`);
    }
    
    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log('⏸️ به‌روزرسانی خودکار متوقف شد');
        }
    }
    
    startAutoUpdate() {
        this.startUpdates();
        console.log('▶️ به‌روزرسانی خودکار شروع شد');
    }
    
    async manualUpdate() {
        console.log('🔄 به‌روزرسانی دستی...');
        await this.updateAllPrices();
    }
    
    getChartsStats() {
        const stats = {
            lastUpdate: new Date(),
            firebaseEnabled: this.firebaseEnabled,
            tokenChart: null,
            pointChart: null
        };
        
        if (window.priceHistoryManager) {
            const tokenStats = window.priceHistoryManager.getHistoryStats('token', 'day');
            const pointStats = window.priceHistoryManager.getHistoryStats('point', 'day');
            
            stats.tokenChart = {
                dataPoints: window.priceHistoryManager.tokenHistory.length,
                minPrice: tokenStats.min,
                maxPrice: tokenStats.max,
                avgPrice: tokenStats.avg,
                currentPrice: window.priceHistoryManager.tokenHistory.length > 0 ? 
                    window.priceHistoryManager.tokenHistory[window.priceHistoryManager.tokenHistory.length - 1].price : 0
            };
            
            stats.pointChart = {
                dataPoints: window.priceHistoryManager.pointHistory.length,
                minPrice: pointStats.min,
                maxPrice: pointStats.max,
                avgPrice: pointStats.avg,
                currentPrice: window.priceHistoryManager.pointHistory.length > 0 ? 
                    window.priceHistoryManager.pointHistory[window.priceHistoryManager.pointHistory.length - 1].price : 0
            };
        }
        
        return stats;
    }
    
    // نمایش آمار در کنسول
    showStats() {
        const stats = this.getChartsStats();
        
        console.log('📊 === آمار چارت‌های قیمت ===');
        console.log(`📅 آخرین به‌روزرسانی: ${new Date(stats.lastUpdate).toLocaleString('fa-IR')}`);
        console.log(`🔥 Firebase: ${stats.firebaseEnabled ? 'فعال' : 'غیرفعال'}`);
        
        if (stats.tokenChart) {
            console.log('💲 === آمار قیمت توکن ===');
            console.log(`📈 تعداد داده‌ها: ${stats.tokenChart.dataPoints}`);
            console.log(`📉 حداقل قیمت: ${stats.tokenChart.minPrice.toFixed(6)} DAI`);
            console.log(`📈 حداکثر قیمت: ${stats.tokenChart.maxPrice.toFixed(6)} DAI`);
            console.log(`📊 میانگین قیمت: ${stats.tokenChart.avgPrice.toFixed(6)} DAI`);
            console.log(`💰 قیمت فعلی: ${stats.tokenChart.currentPrice.toFixed(6)} DAI`);
        }
        
        if (stats.pointChart) {
            console.log('💎 === آمار قیمت پوینت ===');
            console.log(`📈 تعداد داده‌ها: ${stats.pointChart.dataPoints}`);
            console.log(`📉 حداقل قیمت: ${stats.pointChart.minPrice.toFixed(6)} CPA`);
            console.log(`📈 حداکثر قیمت: ${stats.pointChart.maxPrice.toFixed(6)} CPA`);
            console.log(`📊 میانگین قیمت: ${stats.pointChart.avgPrice.toFixed(6)} CPA`);
            console.log(`💰 قیمت فعلی: ${stats.pointChart.currentPrice.toFixed(6)} CPA`);
        }
        
        return stats;
    }
    
    // پاک کردن تاریخچه
    async clearHistory() {
        if (window.priceHistoryManager) {
            await window.priceHistoryManager.clearHistory();
            console.log('🗑️ تاریخچه قیمت‌ها پاک شد');
        }
        
        // به‌روزرسانی چارت‌ها
        this.updateCharts();
    }
    
    // صادر کردن داده‌ها
    exportData() {
        const data = {
            exportDate: new Date().toISOString(),
            firebaseEnabled: this.firebaseEnabled,
            stats: this.getChartsStats(),
            tokenHistory: window.priceHistoryManager ? window.priceHistoryManager.tokenHistory : [],
            pointHistory: window.priceHistoryManager ? window.priceHistoryManager.pointHistory : []
        };
        
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `price-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        console.log('📤 داده‌های قیمت صادر شد');
    }

    // دریافت آمار Firebase
    async getFirebaseStats() {
        if (!this.firebaseEnabled || !window.firebasePriceHistory) {
            console.log('ℹ️ Firebase در دسترس نیست');
            return null;
        }

        try {
            const stats = await window.firebasePriceHistory.getStats();
            if (stats) {
                console.log('📊 === آمار Firebase ===');
                console.log(`📈 تعداد کل رکوردها: ${stats.totalRecords}`);
                if (stats.oldestRecord) {
                    console.log(`📅 قدیمی‌ترین رکورد: ${stats.oldestRecord.timestamp.toLocaleString('fa-IR')}`);
                }
                if (stats.newestRecord) {
                    console.log(`📅 جدیدترین رکورد: ${stats.newestRecord.timestamp.toLocaleString('fa-IR')}`);
                }
                console.log(`📊 میانگین قیمت توکن: ${stats.averageTokenPrice?.toFixed(6) || 0} DAI`);
                console.log(`📊 میانگین قیمت پوینت: ${stats.averagePointPrice?.toFixed(6) || 0} CPA`);
            }
            return stats;
        } catch (error) {
            console.error('❌ خطا در دریافت آمار Firebase:', error);
            return null;
        }
    }

    // صادر کردن تاریخچه Firebase
    async exportFirebaseHistory(format = 'json') {
        if (!this.firebaseEnabled || !window.firebasePriceHistory) {
            console.log('ℹ️ Firebase در دسترس نیست');
            return false;
        }

        try {
            const result = await window.firebasePriceHistory.export(format);
            if (result) {
                console.log(`✅ تاریخچه Firebase به فرمت ${format} صادر شد`);
            }
            return result;
        } catch (error) {
            console.error('❌ خطا در صادر کردن تاریخچه Firebase:', error);
            return false;
        }
    }

    // پاک کردن داده‌های قدیمی Firebase
    async cleanupFirebaseHistory(days = 30) {
        if (!this.firebaseEnabled || !window.firebasePriceHistory) {
            console.log('ℹ️ Firebase در دسترس نیست');
            return false;
        }

        try {
            const result = await window.firebasePriceHistory.cleanup(days);
            if (result) {
                console.log(`✅ داده‌های قدیمی‌تر از ${days} روز از Firebase پاک شد`);
            }
            return result;
        } catch (error) {
            console.error('❌ خطا در پاک کردن داده‌های قدیمی Firebase:', error);
            return false;
        }
    }
}

// ایجاد نمونه سراسری
window.priceChartsManager = new PriceChartsManager();

// تابع‌های کمکی برای استفاده در کنسول
window.updatePrices = () => window.priceChartsManager.manualUpdate();
window.showPriceStats = () => window.priceChartsManager.showStats();
window.clearPriceHistory = () => window.priceChartsManager.clearHistory();
window.exportPriceData = () => window.priceChartsManager.exportData();
window.setUpdateFrequency = (seconds) => window.priceChartsManager.setUpdateFrequency(seconds);
window.stopAutoUpdate = () => window.priceChartsManager.stopAutoUpdate();
window.startAutoUpdate = () => window.priceChartsManager.startAutoUpdate();

// تابع‌های Firebase برای مدیریت تاریخچه
window.getFirebaseHistory = () => window.firebasePriceHistory ? window.firebasePriceHistory.get() : Promise.resolve([]);
window.getFirebaseStats = () => window.priceChartsManager.getFirebaseStats();
window.exportFirebaseHistory = (format) => window.priceChartsManager.exportFirebaseHistory(format);
window.cleanupFirebaseHistory = (days) => window.priceChartsManager.cleanupFirebaseHistory(days);

// راه‌اندازی خودکار
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 مدیر چارت‌های قیمت آماده است!');
}); 

// Export برای استفاده در ماژول‌ها
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PriceChartsManager;
} 