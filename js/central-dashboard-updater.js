/**
 * Central Dashboard Updater - سیستم مرکزی بروزرسانی داشبورد
 * یک interval مرکزی که تک تک مقادیر را چک می‌کند و فقط مقادیر تغییر یافته را بروزرسانی می‌کند
 */

class CentralDashboardUpdater {
    constructor() {
        this.interval = null;
        this.isRunning = false;
        this.updateFrequency = 5000; // 5 ثانیه
        this.previousValues = new Map();
        this.debugMode = false;
        
        // فهرست مقادیری که باید چک شوند
        this.trackedElements = [
            'circulating-supply',
            'total-points', 
            'contract-token-balance',
            'dashboard-cashback-value',
            'dashboard-dai-balance',
            'dashboard-wallets-count',
            'dashboard-registration-price',
            'dashboard-point-value',
            'dashboard-token-price',
            'chart-lvl-usd',
            'point-value'
        ];
    }

    /**
     * شروع سیستم مرکزی - تنها interval فعال
     */
    start() {
        if (this.isRunning) {
            this.log('⚠️ سیستم مرکزی از قبل فعال است');
            return;
        }

        this.log('🚀 شروع سیستم مرکزی بروزرسانی داشبورد...');
        
        // متوقف کردن تمام interval های قدیمی
        this.stopAllOtherIntervals();
        
        this.isRunning = false; // غیرفعال شد - فقط رفرش دستی
        // this.interval = setInterval(() => {
        //     this.checkAndUpdateValues();
        // }, this.updateFrequency);
        
        this.log(`❌ سیستم مرکزی غیرفعال شد - فقط رفرش دستی`);
    }

    /**
     * متوقف کردن سیستم مرکزی
     */
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isRunning = false;
        this.log('⏹️ سیستم مرکزی متوقف شد');
    }

    /**
     * متوقف کردن تمام interval های قدیمی
     */
    stopAllOtherIntervals() {
        this.log('🧹 حذف تمام interval های قدیمی...');
        
        // متوقف کردن dashboard intervals
        if (window.dashboardUpdateInterval) {
            clearInterval(window.dashboardUpdateInterval);
            window.dashboardUpdateInterval = null;
            this.log('❌ dashboardUpdateInterval حذف شد');
        }
        
        // متوقف کردن price charts intervals
        if (window.priceChartsManager && window.priceChartsManager.updateInterval) {
            clearInterval(window.priceChartsManager.updateInterval);
            window.priceChartsManager.updateInterval = null;
            this.log('❌ priceChartsManager interval حذف شد');
        }
        
        // متوقف کردن network stats interval
        if (window.networkStatsInterval) {
            clearInterval(window.networkStatsInterval);
            window.networkStatsInterval = null;
            this.log('❌ networkStatsInterval حذف شد');
        }
        
        // متوقف کردن news auto refresh
        if (window.autoRefreshInterval) {
            clearInterval(window.autoRefreshInterval);
            window.autoRefreshInterval = null;
            this.log('❌ autoRefreshInterval حذف شد');
        }

        // جلوگیری از ایجاد interval های جدید
        window._blockchainInfoIntervalSet = true;
        
        this.log('✅ تمام interval های قدیمی حذف شدند');
    }

    /**
     * چک و بروزرسانی مقادیر - فقط مقادیر تغییر یافته
     */
    async checkAndUpdateValues() {
        try {
            // بررسی وضعیت صفحه
            if (document.hidden) {
                return; // اگر صفحه مخفی است، هیچ کاری نکن
            }

            // چک کردن اتصال کیف پول
            if (!window.contractConfig || !window.contractConfig.contract) {
                return; // اگر کیف پول متصل نیست، هیچ کاری نکن
            }

            const contract = window.contractConfig.contract;
            let updateCount = 0;

            // Helper function for consistent number formatting (مثل main.js)
            const formatNumber = (value, suffix = '', isInteger = false, maxDecimals = 2) => {
                if (value === null || value === undefined || value === '') return 'در دسترس نیست';
                const num = parseFloat(value);
                if (isNaN(num)) return 'در دسترس نیست';
                if (num === 0) return '0' + suffix;
                if (!isInteger && num < 0.000001) {
                    return num.toExponential(6) + suffix;
                }
                if (isInteger) {
                    // برای اعداد صحیح از toLocaleString استفاده کن
                    return Math.floor(num).toLocaleString('en-US') + suffix;
                }
                // برای اعداد اعشاری از toLocaleString استفاده کن (مثل main.js)
                return num.toLocaleString('en-US', {maximumFractionDigits: maxDecimals}) + suffix;
            };

            // 1. چک کردن Total Supply
            try {
                const totalSupply = await contract.totalSupply();
                const supplyNum = parseFloat(ethers.formatUnits(totalSupply, 18));
                const formattedSupply = formatNumber(supplyNum, '', false, 2); // استفاده از formatNumber یکسان
                if (this.updateIfChanged('circulating-supply', formattedSupply)) {
                    updateCount++;
                }
            } catch (error) {
                this.log('❌ خطا در دریافت Total Supply:', error.message);
            }

            // 2. چک کردن Total Points
            try {
                const totalPoints = await contract.totalClaimableBinaryPoints();
                const pointsNum = parseFloat(ethers.formatUnits(totalPoints, 18));
                const formattedPoints = formatNumber(pointsNum, '', true);
                if (this.updateIfChanged('total-points', formattedPoints)) {
                    updateCount++;
                }
            } catch (error) {
                this.log('❌ خطا در دریافت Total Points:', error.message);
            }

            // 3. چک کردن Contract Token Balance
            try {
                const contractBalance = await contract.balanceOf(contract.target);
                const balanceNum = parseFloat(ethers.formatUnits(contractBalance, 18));
                const formattedBalance = formatNumber(balanceNum, '', false, 4); // حذف پسوند CPA
                if (this.updateIfChanged('contract-token-balance', formattedBalance)) {
                    updateCount++;
                }
            } catch (error) {
                this.log('❌ خطا در دریافت Contract Balance:', error.message);
            }

            // 4. چک کردن Token Price
            try {
                const tokenPrice = await contract.getTokenPrice();
                let priceFormatted;
                
                if (window.formatTokenPrice) {
                    priceFormatted = window.formatTokenPrice(tokenPrice);
                } else {
                    const priceNum = parseFloat(ethers.formatUnits(tokenPrice, 18));
                    priceFormatted = formatNumber(priceNum, '', false, 18); // Use 18 decimals for price precision
                }
                
                if (this.updateIfChanged('chart-lvl-usd', priceFormatted)) {
                    updateCount++;
                }
                if (this.updateIfChanged('dashboard-token-price', priceFormatted)) {
                    updateCount++;
                }
            } catch (error) {
                this.log('❌ خطا در دریافت Token Price:', error.message);
            }

            // 5. چک کردن Point Value
            try {
                const pointValue = await contract.getPointValue();
                const pointValueNum = parseFloat(ethers.formatUnits(pointValue, 18));
                const pointValueFormatted = formatNumber(pointValueNum, '', false, 6); // حذف پسوند CPA - Use 6 decimals for point values
                
                if (this.updateIfChanged('point-value', pointValueFormatted)) {
                    updateCount++;
                }
                if (this.updateIfChanged('dashboard-point-value', pointValueFormatted)) {
                    updateCount++;
                }
            } catch (error) {
                this.log('❌ خطا در دریافت Point Value:', error.message);
            }

            // 6. چک کردن Wallets Count
            try {
                const walletsCount = await contract.wallets(0);
                if (this.updateIfChanged('dashboard-wallets-count', walletsCount.toString())) {
                    updateCount++;
                }
            } catch (error) {
                this.log('❌ خطا در دریافت Wallets Count:', error.message);
            }

            // 7. چک کردن DAI Contract Balance
            try {
                let daiBalance;
                
                // سعی کردن با تابع قرارداد اول
                if (typeof contract.getContractdaiBalance === 'function') {
                    daiBalance = await contract.getContractdaiBalance();
                    this.log('✅ DAI balance دریافت شد از getContractdaiBalance');
                } else if (typeof contract.getContractDAIBalance === 'function') {
                    daiBalance = await contract.getContractDAIBalance();
                    this.log('✅ DAI balance دریافت شد از getContractDAIBalance');
                } else {
                    // Fallback به DAI contract مستقیم
                    if (window.DAI_ADDRESS && window.DAI_ABI) {
                        const daiContract = new ethers.Contract(window.DAI_ADDRESS, window.DAI_ABI, contract.provider);
                        daiBalance = await daiContract.balanceOf(contract.target || window.CPA_ADDRESS);
                        this.log('✅ DAI balance دریافت شد از DAI contract');
                    } else {
                        this.log('❌ DAI_ADDRESS یا DAI_ABI موجود نیست');
                        daiBalance = 0n;
                    }
                }
                
                const daiNum = parseFloat(ethers.formatUnits(daiBalance, 18));
                const daiFormatted = formatNumber(daiNum, '', false, 2); // استفاده از formatNumber یکسان
                if (this.updateIfChanged('dashboard-dai-balance', daiFormatted)) {
                    updateCount++;
                }
            } catch (error) {
                this.log('❌ خطا در دریافت DAI Balance:', error.message);
            }

            // 8. چک کردن Registration Price
            try {
                const regPrice = await contract.registrationPrice();
                const regPriceNum = parseFloat(ethers.formatUnits(regPrice, 18));
                const regPriceFormatted = formatNumber(regPriceNum, '', false, 0); // حذف پسوند CPA و استفاده از formatNumber یکسان
                if (this.updateIfChanged('dashboard-registration-price', regPriceFormatted)) {
                    updateCount++;
                }
            } catch (error) {
                this.log('❌ خطا در دریافت Registration Price:', error.message);
            }

            // گزارش نتایج
            if (updateCount > 0) {
                this.log(`🔄 ${updateCount} مقدار بروزرسانی شد`);
            } else {
                this.log('⚡ هیچ تغییری تشخیص داده نشد');
            }

        } catch (error) {
            this.log('❌ خطا در چک کردن مقادیر:', error.message);
        }
    }

    /**
     * بروزرسانی مقدار فقط در صورت تغییر
     */
    updateIfChanged(elementId, newValue) {
        const previousValue = this.previousValues.get(elementId);
        const currentValue = String(newValue);
        
        if (previousValue === currentValue) {
            return false; // تغییری نیست
        }

        // ذخیره مقدار جدید
        this.previousValues.set(elementId, currentValue);
        
        // بروزرسانی UI
        if (window.smartUpdate) {
            window.smartUpdate(elementId, newValue);
        } else if (window.updateValueSmoothly) {
            window.updateValueSmoothly(elementId, newValue);
        } else {
            // fallback
            const el = document.getElementById(elementId);
            if (el) {
                el.textContent = newValue;
            }
        }

        this.log(`🔄 ${elementId}: ${previousValue} → ${currentValue}`);
        return true; // بروزرسانی انجام شد
    }

    /**
     * فعال/غیرفعال کردن حالت debug
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        this.log(`${enabled ? '🐛' : '📊'} حالت debug ${enabled ? 'فعال' : 'غیرفعال'} شد`);
    }

    /**
     * لاگ کردن پیام‌ها
     */
    log(message, ...args) {
        if (this.debugMode) {
            console.log(`[Central Updater] ${message}`, ...args);
        }
    }

    /**
     * دریافت آمار سیستم
     */
    getStats() {
        return {
            isRunning: this.isRunning,
            trackedElements: this.trackedElements.length,
            cachedValues: this.previousValues.size,
            updateFrequency: this.updateFrequency / 1000 + ' seconds',
            debugMode: this.debugMode
        };
    }

    /**
     * ریست کردن حافظه
     */
    reset() {
        this.previousValues.clear();
        this.log('🔄 حافظه مقادیر پاک شد');
    }
}

// ایجاد نمونه سراسری
window.centralDashboardUpdater = new CentralDashboardUpdater();

// شروع خودکار غیرفعال شد
// document.addEventListener('DOMContentLoaded', function() {
//     // تاخیر برای اطمینان از بارگذاری کامل
//     setTimeout(() => {
//         if (window.centralDashboardUpdater) {
//             window.centralDashboardUpdater.start();
//         }
//     }, 3000);
// });

// توابع سراسری برای کنترل
window.startCentralUpdater = function() {
    return window.centralDashboardUpdater.start();
};

window.stopCentralUpdater = function() {
    return window.centralDashboardUpdater.stop();
};

window.getCentralUpdaterStats = function() {
    return window.centralDashboardUpdater.getStats();
};

window.enableCentralDebug = function() {
    return window.centralDashboardUpdater.setDebugMode(true);
};

window.disableCentralDebug = function() {
    return window.centralDashboardUpdater.setDebugMode(false);
};

window.resetCentralCache = function() {
    return window.centralDashboardUpdater.reset();
};

console.log('🎯 Central Dashboard Updater loaded successfully');