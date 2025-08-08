// Chart Testing and Debugging Helper
// دستیار تست و عیب‌یابی چارت‌ها

// تست کامل سیستم چارت‌ها
window.testCompleteChartSystem = async function() {
    console.log('🔬 === تست کامل سیستم چارت‌ها ===');
    
    const results = {
        dependencies: {},
        charts: {},
        database: {},
        contracts: {}
    };
    
    // 1. بررسی وابستگی‌ها
    console.log('📋 بررسی وابستگی‌ها...');
    results.dependencies.chartjs = typeof Chart !== 'undefined';
    results.dependencies.priceHistoryManager = !!window.priceHistoryManager;
    results.dependencies.priceChart = !!window.priceChart;
    results.dependencies.pointChart = !!window.pointChart;
    results.dependencies.contractConfig = !!(window.contractConfig && window.contractConfig.contract);
    
    console.log('✅ وابستگی‌ها:', results.dependencies);
    
    // 2. بررسی چارت‌ها
    console.log('📊 بررسی چارت‌ها...');
    if (window.priceChart) {
        results.charts.tokenChart = {
            initialized: !!window.priceChart.chart,
            canvas: !!document.getElementById('price-chart-canvas'),
            historyLength: window.priceChart.priceHistory.length,
            currentPeriod: window.priceChart.currentTimePeriod
        };
    }
    
    if (window.pointChart) {
        results.charts.pointChart = {
            initialized: !!window.pointChart.chart,
            canvas: !!document.getElementById('point-chart-canvas'),
            historyLength: window.pointChart.pointHistory.length,
            currentPeriod: window.pointChart.currentTimePeriod
        };
    }
    
    console.log('✅ چارت‌ها:', results.charts);
    
    // 3. بررسی دیتابیس
    console.log('💾 بررسی دیتابیس...');
    if (window.priceHistoryManager) {
        results.database = {
            tokenHistoryLength: window.priceHistoryManager.tokenHistory.length,
            pointHistoryLength: window.priceHistoryManager.pointHistory.length,
            firebaseEnabled: window.priceHistoryManager.isFirebaseEnabled(),
            maxHistoryLength: window.priceHistoryManager.maxHistoryLength
        };
        
        // نمایش آخرین قیمت‌ها
        if (window.priceHistoryManager.tokenHistory.length > 0) {
            const lastToken = window.priceHistoryManager.tokenHistory[window.priceHistoryManager.tokenHistory.length - 1];
            results.database.lastTokenPrice = lastToken.price;
            results.database.lastTokenTime = lastToken.time;
        }
        
        if (window.priceHistoryManager.pointHistory.length > 0) {
            const lastPoint = window.priceHistoryManager.pointHistory[window.priceHistoryManager.pointHistory.length - 1];
            results.database.lastPointPrice = lastPoint.price;
            results.database.lastPointTime = lastPoint.time;
        }
    }
    
    console.log('✅ دیتابیس:', results.database);
    
    // 4. بررسی قراردادها
    console.log('🔗 بررسی قراردادها...');
    if (window.contractConfig && window.contractConfig.contract) {
        try {
            results.contracts.connected = true;
            results.contracts.address = window.contractConfig.contract.target || window.contractConfig.contract.address;
            
            // تست دریافت قیمت‌ها
            try {
                const tokenPrice = await window.contractConfig.contract.getTokenPrice();
                results.contracts.tokenPriceCall = true;
                results.contracts.currentTokenPrice = parseFloat(ethers.formatUnits(tokenPrice, 18));
            } catch (error) {
                results.contracts.tokenPriceCall = false;
                results.contracts.tokenPriceError = error.message;
            }
            
            try {
                const pointValue = await window.contractConfig.contract.getPointValue();
                results.contracts.pointValueCall = true;
                results.contracts.currentPointValue = parseFloat(ethers.formatUnits(pointValue, 18));
            } catch (error) {
                results.contracts.pointValueCall = false;
                results.contracts.pointValueError = error.message;
            }
            
        } catch (error) {
            results.contracts.error = error.message;
        }
    } else {
        results.contracts.connected = false;
    }
    
    console.log('✅ قراردادها:', results.contracts);
    
    // 5. خلاصه نتایج
    console.log('📊 === خلاصه نتایج ===');
    
    const issues = [];
    if (!results.dependencies.chartjs) issues.push('Chart.js لود نشده');
    if (!results.dependencies.priceHistoryManager) issues.push('PriceHistoryManager موجود نیست');
    if (!results.dependencies.priceChart) issues.push('PriceChart موجود نیست');
    if (!results.dependencies.pointChart) issues.push('PointChart موجود نیست');
    if (!results.charts.tokenChart?.initialized) issues.push('چارت توکن راه‌اندازی نشده');
    if (!results.charts.pointChart?.initialized) issues.push('چارت پوینت راه‌اندازی نشده');
    if (!results.contracts.connected) issues.push('اتصال به قرارداد برقرار نیست');
    
    if (issues.length === 0) {
        console.log('🎉 همه چیز درست کار می‌کند!');
    } else {
        console.log('⚠️ مشکلات یافت شده:');
        issues.forEach(issue => console.log(`  - ${issue}`));
    }
    
    return results;
};

// تست سریع چارت‌ها
window.quickChartTest = async function() {
    console.log('⚡ تست سریع چارت‌ها...');
    
    // Force refresh both charts
    if (window.priceChart) {
        await window.priceChart.generateTimePeriodData();
        console.log('✅ چارت توکن بازخوانی شد');
    } else {
        console.log('❌ چارت توکن موجود نیست');
    }
    
    if (window.pointChart) {
        await window.pointChart.generateTimePeriodData();
        console.log('✅ چارت پوینت بازخوانی شد');
    } else {
        console.log('❌ چارت پوینت موجود نیست');
    }
    
    // Check if charts are showing data
    const tokenCanvas = document.getElementById('price-chart-canvas');
    const pointCanvas = document.getElementById('point-chart-canvas');
    
    if (tokenCanvas) {
        console.log('📍 Canvas توکن موجود است');
    }
    if (pointCanvas) {
        console.log('📍 Canvas پوینت موجود است');
    }
};

// تولید داده‌های واقعی از قرارداد
window.generateRealPriceData = async function() {
    console.log(`📡 تولید داده‌های واقعی از قرارداد...`);
    
    if (!window.contractConfig || !window.contractConfig.contract) {
        console.error('❌ قرارداد متصل نیست');
        return false;
    }
    
    if (!window.priceHistoryManager) {
        console.error('❌ PriceHistoryManager موجود نیست');
        return false;
    }
    
    try {
        // Get current prices from contract
        console.log('📥 دریافت قیمت‌های فعلی از قرارداد...');
        
        const [tokenPriceRaw, pointValueRaw] = await Promise.all([
            window.contractConfig.contract.getTokenPrice(),
            window.contractConfig.contract.getPointValue()
        ]);
        
        const tokenPrice = parseFloat(ethers.formatUnits(tokenPriceRaw, 18));
        const pointValue = parseFloat(ethers.formatUnits(pointValueRaw, 18));
        
        console.log(`💰 قیمت توکن فعلی: ${tokenPrice}`);
        console.log(`💎 مقدار پوینت فعلی: ${pointValue}`);
        
        // Add to history manager
        await window.priceHistoryManager.addTokenPrice(tokenPrice);
        await window.priceHistoryManager.addPointPrice(pointValue);
        
        console.log('✅ داده‌های واقعی به تاریخچه اضافه شد');
        
        // Force refresh charts with real data
        if (window.priceChart) {
            await window.priceChart.generateTimePeriodData();
        }
        if (window.pointChart) {
            await window.pointChart.generateTimePeriodData();
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ خطا در تولید داده‌های واقعی:', error);
        return false;
    }
};

// حذف تابع شبیه‌سازی و جایگزینی با واقعی
window.generateTestPriceData = window.generateRealPriceData;

// پاک کردن تاریخچه قیمت‌ها
window.clearAllPriceHistory = async function() {
    console.log('🗑️ پاک کردن تاریخچه قیمت‌ها...');
    
    if (window.priceHistoryManager) {
        await window.priceHistoryManager.clearHistory();
        console.log('✅ تاریخچه پاک شد');
    }
    
    // Refresh charts
    await window.quickChartTest();
};

// نمایش وضعیت فعلی
window.showChartStatus = function() {
    console.log('📊 === وضعیت فعلی چارت‌ها ===');
    
    if (window.priceChart) {
        console.log('💲 چارت توکن:');
        console.log(`  - راه‌اندازی شده: ${!!window.priceChart.chart}`);
        console.log(`  - تعداد داده‌ها: ${window.priceChart.priceHistory.length}`);
        console.log(`  - دوره زمانی: ${window.priceChart.currentTimePeriod}`);
    }
    
    if (window.pointChart) {
        console.log('💎 چارت پوینت:');
        console.log(`  - راه‌اندازی شده: ${!!window.pointChart.chart}`);
        console.log(`  - تعداد داده‌ها: ${window.pointChart.pointHistory.length}`);
        console.log(`  - دوره زمانی: ${window.pointChart.currentTimePeriod}`);
    }
    
    if (window.priceHistoryManager) {
        console.log('💾 مدیر تاریخچه:');
        console.log(`  - توکن: ${window.priceHistoryManager.tokenHistory.length} رکورد`);
        console.log(`  - پوینت: ${window.priceHistoryManager.pointHistory.length} رکورد`);
        console.log(`  - Firebase: ${window.priceHistoryManager.isFirebaseEnabled() ? 'فعال' : 'غیرفعال'}`);
    }
};

// تست سیستم زمان‌محور چارت‌ها
window.testTimeBasedCharts = async function() {
    console.log('⏰ === تست سیستم زمان‌محور چارت‌ها ===');
    
    const testResults = {
        timePeriods: {},
        dataPoints: {},
        realTimeUpdates: {},
        timeLabels: {}
    };
    
    // تست دوره‌های زمانی مختلف
    const periods = ['day', 'week', 'month', 'year'];
    
    for (const period of periods) {
        console.log(`📅 تست دوره ${period}...`);
        
        // تست چارت توکن
        if (window.priceChart) {
            window.priceChart.switchTimePeriod(period);
            await window.priceChart.generateTimePeriodData();
            
            testResults.timePeriods[`token_${period}`] = {
                period: period,
                dataPoints: window.priceChart.priceHistory.length,
                expectedPoints: window.priceChart.getExactTimePeriods().points,
                lastTimestamp: window.priceChart.priceHistory.length > 0 ? 
                    window.priceChart.priceHistory[window.priceChart.priceHistory.length - 1].timestamp : null
            };
        }
        
        // تست چارت پوینت
        if (window.pointChart) {
            window.pointChart.switchTimePeriod(period);
            await window.pointChart.generateTimePeriodData();
            
            testResults.timePeriods[`point_${period}`] = {
                period: period,
                dataPoints: window.pointChart.pointHistory.length,
                expectedPoints: window.pointChart.getExactTimePeriods().points,
                lastTimestamp: window.pointChart.pointHistory.length > 0 ? 
                    window.pointChart.pointHistory[window.pointChart.pointHistory.length - 1].timestamp : null
            };
        }
    }
    
    // بررسی اینکه آیا آخرین نقطه تا الان است
    const now = Date.now();
    console.log('🕐 بررسی زمان‌بندی...');
    
    Object.keys(testResults.timePeriods).forEach(key => {
        const test = testResults.timePeriods[key];
        if (test.lastTimestamp) {
            const timeDiff = now - test.lastTimestamp;
            const isUpToDate = timeDiff < 60 * 60 * 1000; // Less than 1 hour old
            test.isUpToDate = isUpToDate;
            test.timeAgoMinutes = Math.floor(timeDiff / (60 * 1000));
        }
    });
    
    // نمایش نتایج
    console.log('📊 نتایج تست:');
    Object.keys(testResults.timePeriods).forEach(key => {
        const test = testResults.timePeriods[key];
        console.log(`  ${key}:`);
        console.log(`    - نقاط داده: ${test.dataPoints}/${test.expectedPoints}`);
        console.log(`    - تا این لحظه: ${test.isUpToDate ? '✅ بله' : '❌ خیر'} (${test.timeAgoMinutes} دقیقه پیش)`);
    });
    
    return testResults;
};

// تست Real-time updates
window.testRealTimeUpdates = async function() {
    console.log('⚡ === تست به‌روزرسانی لحظه‌ای ===');
    
    if (!window.contractConfig || !window.contractConfig.contract) {
        console.log('❌ قرارداد متصل نیست - تست real-time امکان‌پذیر نیست');
        return false;
    }
    
    console.log('📡 دریافت قیمت‌های فعلی از قرارداد...');
    
    try {
        // تست دریافت قیمت توکن
        if (window.priceChart) {
            await window.priceChart.updatePrice();
            console.log('✅ قیمت توکن به‌روزرسانی شد');
        }
        
        // تست دریافت قیمت پوینت
        if (window.pointChart) {
            await window.pointChart.updatePoint();
            console.log('✅ قیمت پوینت به‌روزرسانی شد');
        }
        
        // نمایش آخرین قیمت‌ها
        const tokenDisplay = document.getElementById('current-price-display');
        const pointDisplay = document.getElementById('current-point-display');
        
        console.log('💰 قیمت‌های فعلی:');
        if (tokenDisplay) console.log(`  - توکن: ${tokenDisplay.textContent}`);
        if (pointDisplay) console.log(`  - پوینت: ${pointDisplay.textContent}`);
        
        return true;
        
    } catch (error) {
        console.error('❌ خطا در تست real-time:', error);
        return false;
    }
};

// تست کامل چارت‌های ساعت‌مانند
window.testClockLikeCharts = async function() {
    console.log('🕰️ === تست چارت‌های ساعت‌مانند ===');
    
    // 1. تست سیستم زمان‌محور
    const timeTest = await window.testTimeBasedCharts();
    
    // 2. تست real-time updates
    const realTimeTest = await window.testRealTimeUpdates();
    
    // 3. تست هر دوره زمانی
    console.log('📈 تست نمایش دوره‌های زمانی...');
    const periods = ['day', 'week', 'month', 'year'];
    const expectedPoints = { day: 24, week: 7, month: 30, year: 12 };
    
    for (const period of periods) {
        if (window.priceChart) {
            window.priceChart.switchTimePeriod(period);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for update
            
            const actualPoints = window.priceChart.priceHistory.length;
            const maxPoints = expectedPoints[period];
            
            console.log(`  📊 ${period}: ${actualPoints} نقطه (حداکثر: ${maxPoints}) ${actualPoints <= maxPoints ? '✅' : '❌'}`);
        }
    }
    
    // 4. بررسی اینکه فقط تا الان نمایش داده می‌شود
    console.log('⏰ بررسی محدودیت زمانی "تا الان"...');
    const now = Date.now();
    
    if (window.priceChart && window.priceChart.priceHistory.length > 0) {
        const futurePoints = window.priceChart.priceHistory.filter(point => 
            point.timestamp > now
        );
        console.log(`  - نقاط آینده در چارت توکن: ${futurePoints.length} ${futurePoints.length === 0 ? '✅' : '❌'}`);
    }
    
    if (window.pointChart && window.pointChart.pointHistory.length > 0) {
        const futurePoints = window.pointChart.pointHistory.filter(point => 
            point.timestamp > now
        );
        console.log(`  - نقاط آینده در چارت پوینت: ${futurePoints.length} ${futurePoints.length === 0 ? '✅' : '❌'}`);
    }
    
    console.log('🎉 تست چارت‌های ساعت‌مانند تکمیل شد!');
    
    return {
        timeTest,
        realTimeTest,
        clockLike: true
    };
};

// تست پیوستگی چارت‌ها
window.testChartContinuity = function() {
    console.log('🔗 === تست پیوستگی چارت‌ها ===');
    
    const results = {
        tokenChart: null,
        pointChart: null,
        continuityIssues: []
    };
    
    // تست چارت توکن
    if (window.priceChart && window.priceChart.priceHistory.length > 0) {
        const tokenHistory = window.priceChart.priceHistory;
        let zeroCount = 0;
        let continuityBreaks = 0;
        let lastPrice = null;
        
        tokenHistory.forEach((point, index) => {
            if (point.price === 0) {
                zeroCount++;
                results.continuityIssues.push(`صفر در نقطه ${index} چارت توکن`);
            }
            
            if (lastPrice !== null && Math.abs(point.price - lastPrice) / lastPrice > 0.5) {
                continuityBreaks++;
                results.continuityIssues.push(`جهش قیمت در نقطه ${index} چارت توکن: ${lastPrice.toFixed(6)} -> ${point.price.toFixed(6)}`);
            }
            
            lastPrice = point.price;
        });
        
        results.tokenChart = {
            totalPoints: tokenHistory.length,
            zeroCount: zeroCount,
            continuityBreaks: continuityBreaks,
            isContinuous: zeroCount === 0 && continuityBreaks < 2,
            priceRange: {
                min: Math.min(...tokenHistory.map(p => p.price)),
                max: Math.max(...tokenHistory.map(p => p.price))
            }
        };
    }
    
    // تست چارت پوینت
    if (window.pointChart && window.pointChart.pointHistory.length > 0) {
        const pointHistory = window.pointChart.pointHistory;
        let zeroCount = 0;
        let continuityBreaks = 0;
        let lastPrice = null;
        
        pointHistory.forEach((point, index) => {
            if (point.price === 0) {
                zeroCount++;
                results.continuityIssues.push(`صفر در نقطه ${index} چارت پوینت`);
            }
            
            if (lastPrice !== null && Math.abs(point.price - lastPrice) / lastPrice > 0.5) {
                continuityBreaks++;
                results.continuityIssues.push(`جهش قیمت در نقطه ${index} چارت پوینت: ${lastPrice.toFixed(6)} -> ${point.price.toFixed(6)}`);
            }
            
            lastPrice = point.price;
        });
        
        results.pointChart = {
            totalPoints: pointHistory.length,
            zeroCount: zeroCount,
            continuityBreaks: continuityBreaks,
            isContinuous: zeroCount === 0 && continuityBreaks < 2,
            priceRange: {
                min: Math.min(...pointHistory.map(p => p.price)),
                max: Math.max(...pointHistory.map(p => p.price))
            }
        };
    }
    
    // نمایش نتایج
    console.log('📊 نتایج تست پیوستگی:');
    
    if (results.tokenChart) {
        console.log(`🟢 چارت توکن: ${results.tokenChart.isContinuous ? '✅ پیوسته' : '❌ قطع دارد'}`);
        console.log(`   - نقاط صفر: ${results.tokenChart.zeroCount}`);
        console.log(`   - جهش‌های قیمت: ${results.tokenChart.continuityBreaks}`);
        console.log(`   - محدوده قیمت: ${results.tokenChart.priceRange.min.toFixed(6)} - ${results.tokenChart.priceRange.max.toFixed(6)}`);
    }
    
    if (results.pointChart) {
        console.log(`🟣 چارت پوینت: ${results.pointChart.isContinuous ? '✅ پیوسته' : '❌ قطع دارد'}`);
        console.log(`   - نقاط صفر: ${results.pointChart.zeroCount}`);
        console.log(`   - جهش‌های قیمت: ${results.pointChart.continuityBreaks}`);
        console.log(`   - محدوده قیمت: ${results.pointChart.priceRange.min.toFixed(6)} - ${results.pointChart.priceRange.max.toFixed(6)}`);
    }
    
    if (results.continuityIssues.length > 0) {
        console.log('⚠️ مشکلات یافت شده:');
        results.continuityIssues.forEach(issue => console.log(`  - ${issue}`));
    } else {
        console.log('🎉 هیچ مشکل پیوستگی یافت نشد!');
    }
    
    return results;
};

// تست کامل پیوستگی و عدم نمایش صفر
window.testNoContinuousZeros = async function() {
    console.log('🚫 === تست عدم نمایش صفرهای غیرضروری ===');
    
    // اول داده واقعی بگیریم
    await window.generateRealPriceData();
    
    // حالا پیوستگی را تست کنیم
    const continuityResults = window.testChartContinuity();
    
    // بررسی ویژه برای صفرها
    const zeroIssues = [];
    
    if (window.priceChart) {
        const zeros = window.priceChart.priceHistory.filter(p => p.price === 0);
        if (zeros.length > 0) {
            zeroIssues.push(`چارت توکن دارای ${zeros.length} نقطه صفر است`);
        }
    }
    
    if (window.pointChart) {
        const zeros = window.pointChart.pointHistory.filter(p => p.price === 0);
        if (zeros.length > 0) {
            zeroIssues.push(`چارت پوینت دارای ${zeros.length} نقطه صفر است`);
        }
    }
    
    console.log(zeroIssues.length === 0 ? '✅ هیچ صفر غیرضروری یافت نشد' : '❌ صفرهای غیرضروری موجود است:');
    zeroIssues.forEach(issue => console.log(`  - ${issue}`));
    
    return {
        continuity: continuityResults,
        zeroIssues: zeroIssues,
        isValid: zeroIssues.length === 0 && continuityResults.continuityIssues.length === 0
    };
};

// اجرای تست خودکار هنگام بارگذاری
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        console.log('🚀 === دستیار تست چارت‌ها آماده است ===');
        console.log('💡 دستورات مفید:');
        console.log('  - window.testCompleteChartSystem() - تست کامل سیستم');
        console.log('  - window.testChartContinuity() - تست پیوستگی چارت‌ها');
        console.log('  - window.testNoContinuousZeros() - تست عدم نمایش صفر');
        console.log('  - window.testClockLikeCharts() - تست چارت‌های ساعت‌مانند');
        console.log('  - window.testTimeBasedCharts() - تست سیستم زمان‌محور');
        console.log('  - window.testRealTimeUpdates() - تست به‌روزرسانی لحظه‌ای');
        console.log('  - window.quickChartTest() - تست سریع');
        console.log('  - window.generateRealPriceData() - دریافت داده واقعی');
        console.log('  - window.clearAllPriceHistory() - پاک کردن تاریخچه');
        console.log('  - window.showChartStatus() - نمایش وضعیت');
    }, 2000);
});