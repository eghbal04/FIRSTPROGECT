// Real Chart Validator - اعتبارسنج چارت‌های واقعی
// این فایل اطمینان می‌دهد که چارت‌ها فقط داده‌های واقعی نشان می‌دهند

class RealChartValidator {
    constructor() {
        this.validationRules = {
            noFutureData: true,
            onlyRealPrices: true,
            noSimulation: true,
            contractRequired: true
        };
        
        this.init();
    }
    
    init() {
        console.log('🔒 راه‌اندازی اعتبارسنج چارت‌های واقعی...');
        this.startContinuousValidation();
    }
    
    // اعتبارسنجی مداوم چارت‌ها
    startContinuousValidation() {
        setInterval(() => {
            this.validateAllCharts();
        }, 10000); // هر 10 ثانیه بررسی
    }
    
    // اعتبارسنجی تمام چارت‌ها
    validateAllCharts() {
        const results = {
            tokenChart: this.validateTokenChart(),
            pointChart: this.validatePointChart(),
            timestamp: new Date().toISOString()
        };
        
        // اگر مشکلی یافت شود، هشدار دهد
        if (!results.tokenChart.valid || !results.pointChart.valid) {
            console.warn('⚠️ مشکل در اعتبارسنجی چارت‌ها یافت شد:', results);
            this.fixChartIssues(results);
        }
        
        return results;
    }
    
    // اعتبارسنجی چارت توکن
    validateTokenChart() {
        if (!window.priceChart) {
            return { valid: false, reason: 'چارت توکن موجود نیست' };
        }
        
        const chart = window.priceChart;
        const now = Date.now();
        
        // بررسی داده‌های آینده
        const futurePoints = chart.priceHistory.filter(point => 
            point.timestamp > now
        );
        
        if (futurePoints.length > 0) {
            return { 
                valid: false, 
                reason: `${futurePoints.length} نقطه آینده یافت شد`,
                futureCount: futurePoints.length 
            };
        }
        
        // بررسی اینکه آیا داده‌ها واقعی هستند
        const hasRealData = chart.priceHistory.length > 0 && 
            chart.priceHistory.some(point => point.price > 0);
            
        if (!hasRealData) {
            return { 
                valid: false, 
                reason: 'هیچ داده واقعی یافت نشد',
                dataCount: chart.priceHistory.length 
            };
        }
        
        // بررسی پیوستگی (عدم وجود صفرهای غیرضروری)
        const zeroPoints = chart.priceHistory.filter(point => point.price === 0);
        if (zeroPoints.length > 0) {
            return {
                valid: false,
                reason: `${zeroPoints.length} نقطه صفر غیرضروری یافت شد - چارت پیوسته نیست`,
                zeroCount: zeroPoints.length
            };
        }
        
        return { 
            valid: true, 
            dataCount: chart.priceHistory.length,
            lastUpdate: chart.priceHistory.length > 0 ? 
                chart.priceHistory[chart.priceHistory.length - 1].timestamp : null,
            isContinuous: true
        };
    }
    
    // اعتبارسنجی چارت پوینت
    validatePointChart() {
        if (!window.pointChart) {
            return { valid: false, reason: 'چارت پوینت موجود نیست' };
        }
        
        const chart = window.pointChart;
        const now = Date.now();
        
        // بررسی داده‌های آینده
        const futurePoints = chart.pointHistory.filter(point => 
            point.timestamp > now
        );
        
        if (futurePoints.length > 0) {
            return { 
                valid: false, 
                reason: `${futurePoints.length} نقطه آینده در چارت پوینت یافت شد`,
                futureCount: futurePoints.length 
            };
        }
        
        // بررسی اینکه آیا داده‌ها واقعی هستند
        const hasRealData = chart.pointHistory.length > 0 && 
            chart.pointHistory.some(point => point.price > 0);
            
        if (!hasRealData) {
            return { 
                valid: false, 
                reason: 'هیچ داده واقعی پوینت یافت نشد',
                dataCount: chart.pointHistory.length 
            };
        }
        
        // بررسی پیوستگی (عدم وجود صفرهای غیرضروری)
        const zeroPoints = chart.pointHistory.filter(point => point.price === 0);
        if (zeroPoints.length > 0) {
            return {
                valid: false,
                reason: `${zeroPoints.length} نقطه صفر غیرضروری در چارت پوینت یافت شد - چارت پیوسته نیست`,
                zeroCount: zeroPoints.length
            };
        }
        
        return { 
            valid: true, 
            dataCount: chart.pointHistory.length,
            lastUpdate: chart.pointHistory.length > 0 ? 
                chart.pointHistory[chart.pointHistory.length - 1].timestamp : null,
            isContinuous: true
        };
    }
    
    // رفع مشکلات یافت شده
    async fixChartIssues(results) {
        console.log('🔧 تلاش برای رفع خودکار مشکلات...');
        
        const now = Date.now();
        
        // رفع مشکل چارت توکن
        if (!results.tokenChart.valid && window.priceChart) {
            if (results.tokenChart.futureCount > 0) {
                // حذف نقاط آینده
                window.priceChart.priceHistory = window.priceChart.priceHistory.filter(
                    point => point.timestamp <= now
                );
                console.log(`🗑️ ${results.tokenChart.futureCount} نقطه آینده از چارت توکن حذف شد`);
            }
            
            if (results.tokenChart.zeroCount > 0) {
                // حذف نقاط صفر غیرضروری
                console.log(`🔧 حذف ${results.tokenChart.zeroCount} نقطه صفر از چارت توکن...`);
                await window.priceChart.generateTimePeriodData(); // بازسازی با منطق پیوستگی
            }
            
            // اگر داده واقعی نداریم، سعی کن از قرارداد بگیر
            if (results.tokenChart.reason.includes('هیچ داده واقعی یافت نشد')) {
                await this.forceRealDataUpdate();
            }
        }
        
        // رفع مشکل چارت پوینت
        if (!results.pointChart.valid && window.pointChart) {
            if (results.pointChart.futureCount > 0) {
                // حذف نقاط آینده
                window.pointChart.pointHistory = window.pointChart.pointHistory.filter(
                    point => point.timestamp <= now
                );
                console.log(`🗑️ ${results.pointChart.futureCount} نقطه آینده از چارت پوینت حذف شد`);
            }
            
            if (results.pointChart.zeroCount > 0) {
                // حذف نقاط صفر غیرضروری
                console.log(`🔧 حذف ${results.pointChart.zeroCount} نقطه صفر از چارت پوینت...`);
                await window.pointChart.generateTimePeriodData(); // بازسازی با منطق پیوستگی
            }
            
            // اگر داده واقعی نداریم، سعی کن از قرارداد بگیر
            if (results.pointChart.reason.includes('هیچ داده واقعی یافت نشد')) {
                await this.forceRealDataUpdate();
            }
        }
        
        // بازخوانی چارت‌ها
        if (window.priceChart) window.priceChart.updateChart();
        if (window.pointChart) window.pointChart.updateChart();
    }
    
    // اجبار به‌روزرسانی داده‌های واقعی
    async forceRealDataUpdate() {
        if (!window.contractConfig || !window.contractConfig.contract) {
            console.log('❌ قرارداد متصل نیست - نمی‌توان داده واقعی دریافت کرد');
            return false;
        }
        
        try {
            console.log('💉 اجبار دریافت قیمت‌های واقعی از قرارداد...');
            
            if (window.priceChart) {
                await window.priceChart.updatePrice();
            }
            
            if (window.pointChart) {
                await window.pointChart.updatePoint();
            }
            
            console.log('✅ داده‌های واقعی اجباری دریافت شد');
            return true;
            
        } catch (error) {
            console.error('❌ خطا در دریافت اجباری داده‌ها:', error);
            return false;
        }
    }
    
    // گزارش کامل وضعیت
    getFullReport() {
        const validation = this.validateAllCharts();
        const status = {
            isValid: validation.tokenChart.valid && validation.pointChart.valid,
            details: validation,
            recommendations: []
        };
        
        if (!validation.tokenChart.valid) {
            status.recommendations.push(`🔧 چارت توکن: ${validation.tokenChart.reason}`);
        }
        
        if (!validation.pointChart.valid) {
            status.recommendations.push(`🔧 چارت پوینت: ${validation.pointChart.reason}`);
        }
        
        if (status.recommendations.length === 0) {
            status.recommendations.push('✅ همه چیز سالم است');
        }
        
        return status;
    }
}

// ایجاد نمونه سراسری
window.chartValidator = new RealChartValidator();

// توابع کمکی برای کاربر
window.validateCharts = () => window.chartValidator.validateAllCharts();
window.getChartReport = () => window.chartValidator.getFullReport();
window.fixChartsNow = () => window.chartValidator.forceRealDataUpdate();

// نمایش وضعیت در کنسول
window.showChartValidation = function() {
    const report = window.getChartReport();
    
    console.log('🔍 === گزارش اعتبارسنجی چارت‌ها ===');
    console.log(`وضعیت کلی: ${report.isValid ? '✅ سالم' : '❌ مشکل دار'}`);
    
    report.recommendations.forEach(rec => console.log(rec));
    
    console.log('\n📊 جزئیات:');
    console.log('چارت توکن:', report.details.tokenChart);
    console.log('چارت پوینت:', report.details.pointChart);
    
    return report;
};

console.log('🔒 اعتبارسنج چارت‌های واقعی فعال شد - هر 10 ثانیه بررسی می‌کند');