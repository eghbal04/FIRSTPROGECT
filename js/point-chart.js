// Point Chart Implementation - Simple Line Only
class PointChart {
    constructor() {
        this.chart = null;
        this.pointHistory = [];
        this.currentTimePeriod = 'day';
        this.timePeriods = {
            day: { points: 24, interval: 3600000, label: 'Hour' }, // 24 hours, 1 hour intervals
            week: { points: 7, interval: 86400000, label: 'Day' }, // 7 days, 1 day intervals
            month: { points: 30, interval: 86400000, label: 'Day' }, // 30 days, 1 day intervals
            year: { points: 12, interval: 2592000000, label: 'Month' } // 12 months, 1 month intervals
        };
        this.init();
    }

    init() {

        this.initializeChart();
        this.setupTimePeriodSelect();
        this.startPointUpdates();

    }

    setupTimePeriodSelect() {
        const select = document.getElementById('point-period-select');
        if (select) {
            select.addEventListener('change', (e) => {
                const period = e.target.value;
                this.switchTimePeriod(period);
            });
        }
    }
    switchTimePeriod(period) {
        this.currentTimePeriod = period;
        // Update select value
        const select = document.getElementById('point-period-select');
        if (select) select.value = period;
        this.generateTimePeriodData();
        if (typeof updatePriceStats === 'function') updatePriceStats();
    }

    async generateTimePeriodData() {
        console.log(`📊 بارگذاری داده‌های واقعی چارت پوینت برای دوره: ${this.currentTimePeriod}`);
        
        const now = new Date();
        this.pointHistory = [];
        
        // ONLY use real data from PriceHistoryManager or current contract price
        if (!window.priceHistoryManager || !window.priceHistoryManager.pointHistory || window.priceHistoryManager.pointHistory.length === 0) {
            console.log('⚠️ هیچ داده قیمت پوینت واقعی موجود نیست - چارت خالی خواهد بود');
            
            // Try to get current price from contract
            if (window.contractConfig && window.contractConfig.contract) {
                try {
                    const pointValue = await window.contractConfig.contract.getPointValue();
                    const pointValueNum = parseFloat(ethers.formatUnits(pointValue, 18));
                    
                    this.pointHistory.push({
                        time: now,
                        price: pointValueNum,
                        timestamp: now.getTime()
                    });
                    
                    console.log(`✅ فقط قیمت پوینت فعلی از قرارداد: ${pointValueNum}`);
                } catch (error) {
                    console.error('❌ خطا در دریافت قیمت پوینت فعلی:', error);
                }
            }
            
            this.updateChart();
            return;
        }
        
        // Get time configuration
        const timeConfig = this.getExactTimePeriods();
        const startTime = timeConfig.startTime.getTime();
        const endTime = now.getTime();
        
        // Create continuous chart with proper time intervals
        this.pointHistory = [];
        let lastKnownPrice = null;
        
        // Get all available data first
        const allPointData = window.priceHistoryManager.pointHistory
            .filter(entry => {
                const entryTime = entry.time ? entry.time.getTime() : entry.timestamp;
                return entryTime <= endTime; // Only data up to now
            })
            .sort((a, b) => {
                const timeA = a.time ? a.time.getTime() : a.timestamp;
                const timeB = b.time ? b.time.getTime() : b.timestamp;
                return timeA - timeB;
            });
        
        console.log(`📈 یافت شد ${allPointData.length} رکورد واقعی پوینت`);
        
        // If we have any data, get the most recent price as baseline
        if (allPointData.length > 0) {
            lastKnownPrice = allPointData[allPointData.length - 1].price;
        }
        
        // Generate time points and find appropriate prices
        for (let i = 0; i < timeConfig.points; i++) {
            const pointTime = new Date(timeConfig.startTime.getTime() + (i * timeConfig.interval));
            
            // Don't show future data
            if (pointTime.getTime() > now.getTime()) {
                break;
            }
            
            // Find the best price for this time point (maintains continuity)
            const priceAtTime = this.findClosestPrice(pointTime, 'point');
            const finalPrice = priceAtTime !== null ? priceAtTime : lastKnownPrice;
            
            // Update last known price if we found a newer one
            if (priceAtTime !== null) {
                lastKnownPrice = priceAtTime;
            }
            
            // Only add point if we have a valid price (no zeros unless real)
            if (finalPrice !== null && finalPrice !== undefined) {
                this.pointHistory.push({
                    time: pointTime,
                    price: finalPrice,
                    timestamp: pointTime.getTime()
                });
            }
        }
        
        console.log(`✅ نمایش ${this.pointHistory.length} نقطه داده واقعی پوینت (آخرین: ${this.pointHistory.length > 0 ? new Date(this.pointHistory[this.pointHistory.length - 1].timestamp).toLocaleString('fa-IR') : 'ندارد'})`);
        this.updateChart();
    }
    
    getExactTimePeriods() {
        const now = new Date();
        
        switch (this.currentTimePeriod) {
            case 'day':
                // 24 hours - each hour from 24 hours ago to now
                const dayStart = new Date(now);
                dayStart.setHours(now.getHours() - 23, 0, 0, 0);
                return {
                    points: 24,
                    interval: 60 * 60 * 1000, // 1 hour
                    startTime: dayStart
                };
                
            case 'week':
                // 7 days - each day from 7 days ago to now
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - 6);
                weekStart.setHours(0, 0, 0, 0);
                return {
                    points: 7,
                    interval: 24 * 60 * 60 * 1000, // 1 day
                    startTime: weekStart
                };
                
            case 'month':
                // 30 days - each day from 30 days ago to now
                const monthStart = new Date(now);
                monthStart.setDate(now.getDate() - 29);
                monthStart.setHours(0, 0, 0, 0);
                return {
                    points: 30,
                    interval: 24 * 60 * 60 * 1000, // 1 day
                    startTime: monthStart
                };
                
            case 'year':
                // 12 months - each month from 12 months ago to now
                const yearStart = new Date(now);
                yearStart.setMonth(now.getMonth() - 11);
                yearStart.setDate(1);
                yearStart.setHours(0, 0, 0, 0);
                return {
                    points: 12,
                    interval: 30 * 24 * 60 * 60 * 1000, // ~1 month
                    startTime: yearStart
                };
                
            default:
                return this.getExactTimePeriods.call({currentTimePeriod: 'day'});
        }
    }
    
    findClosestPrice(targetTime, type = 'point') {
        if (!window.priceHistoryManager) return null;
        
        const history = type === 'token' ? 
            window.priceHistoryManager.tokenHistory : 
            window.priceHistoryManager.pointHistory;
            
        if (history.length === 0) return null;
        
        // Sort history by time to ensure proper order
        const sortedHistory = [...history].sort((a, b) => {
            const timeA = a.time ? a.time.getTime() : a.timestamp;
            const timeB = b.time ? b.time.getTime() : b.timestamp;
            return timeA - timeB;
        });
        
        // Find the LAST price before or at the target time (maintain continuity)
        let lastValidPrice = null;
        
        for (const entry of sortedHistory) {
            const entryTime = entry.time ? entry.time.getTime() : entry.timestamp;
            
            if (entryTime <= targetTime.getTime()) {
                lastValidPrice = entry.price;
            } else {
                // We've gone past the target time, use last valid price
                break;
            }
        }
        
        // Return the last known price (continuous chart behavior)
        return lastValidPrice;
    }

    // REMOVED: No more simulated prices - only real data from contracts
    generateSimulatedPrice(timestamp) {
        console.warn('🚫 تلاش برای استفاده از داده پوینت شبیه‌سازی - این عملیات مجاز نیست');
        return 0; // Never return simulated data
    }
    
    getCurrentPointPrice() {
        // Get last known price from history manager
        if (window.priceHistoryManager && window.priceHistoryManager.pointHistory.length > 0) {
            const lastEntry = window.priceHistoryManager.pointHistory[window.priceHistoryManager.pointHistory.length - 1];
            return lastEntry.price;
        }
        return 0;
    }

    initializeChart() {
        const ctx = document.getElementById('point-chart-canvas');
        if (!ctx) {
            console.warn('⚠️ المنت point-chart-canvas پیدا نشد، چارت ساخته نمی‌شود');
            // Retry after a short delay
            setTimeout(() => this.initializeChart(), 1000);
            return;
        }

        // Destroy existing chart if it exists
        if (this.chart) {
            try {
                this.chart.destroy();
            } catch (err) {
                console.warn('⚠️ خطا در حذف چارت قبلی:', err);
            }
        }

        // Check if canvas is already in use by another chart
        try {
            const existingChart = Chart.getChart(ctx);
            if (existingChart) {
                console.log('🔄 حذف چارت موجود از canvas...');
                existingChart.destroy();
            }
        } catch (err) {
            console.warn('⚠️ خطا در بررسی چارت موجود:', err);
        }

        try {
            // Check if Chart.js is available
            if (typeof Chart === 'undefined') {
                console.warn('⚠️ Chart.js در دسترس نیست، منتظر بارگذاری...');
                setTimeout(() => this.initializeChart(), 1000);
                return;
            }
            
            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Point Value',
                        data: [],
                        borderColor: '#a786ff',
                        backgroundColor: 'rgba(167, 134, 255, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 3,
                        pointBackgroundColor: '#a786ff',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: '#a786ff',
                        pointHoverBorderColor: '#fff',
                        pointHoverBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            enabled: true,
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#a786ff',
                            bodyColor: '#fff',
                            borderColor: '#a786ff',
                            borderWidth: 1,
                            cornerRadius: 8,
                            displayColors: false,
                            callbacks: {
                                title: function(context) {
                                    const dataIndex = context[0].dataIndex;
                                    const period = window.pointChart?.currentTimePeriod || 'day';
                                    const timestamp = window.pointChart?.pointHistory?.[dataIndex]?.time;
                                    
                                    if (timestamp) {
                                        const date = new Date(timestamp);
                                        if (period === 'day') {
                                            return '•';
                                        } else if (period === 'week') {
                                            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                                            return days[dataIndex] || '•';
                                        } else if (period === 'month') {
                                            return '•';
                                        } else if (period === 'year') {
                                            return '•';
                                        }
                                    }
                                    return '•';
                                },
                                label: function(context) {
                                    const price = context.parsed.y;
                                    if (price === 0 || price === null) {
                                        return 'No data';
                                    }
                                    return `Point Value: ${window.priceHistoryManager ? 
                                        window.priceHistoryManager.formatPrice(price) : 
                                        price.toFixed(6)} CPA`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            display: false,
                            grid: {
                                display: false
                            }
                        },
                        y: {
                            display: true,
                            position: 'right',
                            grid: {
                                color: 'rgba(167, 134, 255, 0.1)',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#a786ff',
                                font: {
                                    family: 'monospace',
                                    size: 10
                                },
                                callback: function(value) {
                                    if (value === 0) return '';
                                    return window.priceHistoryManager ? 
                                        window.priceHistoryManager.formatPrice(value) : 
                                        value.toFixed(6);
                                }
                            }
                        }
                    },
                    elements: {
                        point: {
                            hoverRadius: 6
                        }
                    }
                }
            });
        } catch (e) {
            if (e.message && e.message.includes('Canvas is already in use')) {
                if (this.chart) {
                    try { this.chart.destroy(); } catch (err) {}
                }
                this.chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: [],
                        datasets: [{
                            label: 'Point Value',
                            data: [],
                            borderColor: '#a786ff',
                            backgroundColor: 'rgba(167, 134, 255, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 3,
                            pointBackgroundColor: '#a786ff',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointHoverRadius: 6,
                            pointHoverBackgroundColor: '#a786ff',
                            pointHoverBorderColor: '#fff',
                            pointHoverBorderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: {
                            intersect: false,
                            mode: 'index'
                        },
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                enabled: true,
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                titleColor: '#a786ff',
                                bodyColor: '#fff',
                                borderColor: '#a786ff',
                                borderWidth: 1,
                                cornerRadius: 8,
                                displayColors: false,
                                callbacks: {
                                    title: function(context) {
                                        const dataIndex = context[0].dataIndex;
                                        const period = window.pointChart?.currentTimePeriod || 'day';
                                        const timestamp = window.pointChart?.pointHistory?.[dataIndex]?.time;
                                        
                                        if (timestamp) {
                                            const date = new Date(timestamp);
                                            if (period === 'day') {
                                                return '•';
                                            } else if (period === 'week') {
                                                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                                                return days[dataIndex] || '•';
                                            } else if (period === 'month') {
                                                return '•';
                                            } else if (period === 'year') {
                                                return '•';
                                            }
                                        }
                                        return '•';
                                    },
                                    label: function(context) {
                                        const price = context.parsed.y;
                                        if (price === 0 || price === null) {
                                            return 'No data';
                                        }
                                        return `Point Value: ${window.priceHistoryManager ? 
                                            window.priceHistoryManager.formatPrice(price) : 
                                            price.toFixed(6)} CPA`;
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                display: false,
                                grid: {
                                    display: false
                                }
                            },
                            y: {
                                display: true,
                                position: 'right',
                                grid: {
                                    color: 'rgba(167, 134, 255, 0.1)',
                                    drawBorder: false
                                },
                                ticks: {
                                    color: '#a786ff',
                                    font: {
                                        family: 'monospace',
                                        size: 10
                                    },
                                    callback: function(value) {
                                        if (value === 0) return '';
                                        return window.priceHistoryManager ? 
                                            window.priceHistoryManager.formatPrice(value) : 
                                            value.toFixed(6);
                                    }
                                }
                            }
                        },
                        elements: {
                            point: {
                                hoverRadius: 6
                            }
                        }
                    }
                });
            } else {
                throw e;
            }
        }
    }

    async startPointUpdates() {
        // Wait for price history manager to be ready
        await this.waitForDependencies();
        
        // Generate initial data for current time period
        await this.generateTimePeriodData();
        
        // Initial update from contract
        await this.updatePoint();
        
        // Update point price every 30 seconds
        setInterval(async () => {
            await this.updatePoint();
        }, 30000);
    }
    
    async waitForDependencies() {
        let attempts = 0;
        const maxAttempts = 20; // Wait up to 10 seconds
        
        while (attempts < maxAttempts) {
            if (window.priceHistoryManager && window.priceHistoryManager.isFirebaseEnabled !== undefined) {
                console.log('✅ PriceHistoryManager آماده است');
                
                // Try to reload from Firebase if available
                if (window.priceHistoryManager.isFirebaseEnabled()) {
                    await window.priceHistoryManager.reloadFromFirebase();
                }
                
                break;
            }
            
            console.log('⏳ منتظر آماده شدن PriceHistoryManager...', attempts + 1);
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }
    }

    async updatePoint() {
        try {
            if (!window.contractConfig || !window.contractConfig.contract) {
                console.log('⏳ منتظر اتصال به قرارداد...');
                return;
            }
            
            const contract = window.contractConfig.contract;
            console.log('💎 دریافت قیمت پوینت از قرارداد...');
            
            const pointValue = await contract.getPointValue();
            const pointValueNum = parseFloat(ethers.formatUnits(pointValue, 18));
            
            console.log('✅ قیمت پوینت دریافت شد:', pointValueNum);
            
            // Update current point display
            const pointDisplay = document.getElementById('current-point-display');
            if (pointDisplay) {
                pointDisplay.textContent = window.priceHistoryManager ? 
                    window.priceHistoryManager.formatPrice(pointValueNum) : 
                    pointValueNum.toFixed(6);
            }
            
            // Add to history manager
            if (window.priceHistoryManager) {
                await window.priceHistoryManager.addPointPrice(pointValueNum);
            }
            
            // Update chart with new real-time data point
            if (this.chart && this.chart.data && this.chart.data.datasets) {
                // Add current price as new data point
                this.addCurrentPricePoint(pointValueNum);
                this.updateChart();
            } else {
                console.log('⏳ چارت هنوز آماده نیست، منتظر راه‌اندازی...');
            }
            
        } catch (error) {
            console.error('❌ خطا در به‌روزرسانی قیمت پوینت:', error);
        }
    }

    updateChart() {
        const ctx = document.getElementById('point-chart-canvas');
        if (!ctx) {
            console.warn('⚠️ المنت point-chart-canvas برای آپدیت پیدا نشد');
            return;
        }
        if (!this.chart || this.pointHistory.length === 0) return;
        
        // Create proper time-based labels
        const labels = this.pointHistory.map((item, index) => {
            const time = item.time;
            
            switch (this.currentTimePeriod) {
                case 'day':
                    return time.getHours().toString().padStart(2, '0') + ':00';
                case 'week':
                    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    return dayNames[time.getDay()];
                case 'month':
                    return time.getDate().toString();
                case 'year':
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return monthNames[time.getMonth()];
                default:
                    return index.toString();
            }
        });
        
        const prices = this.pointHistory.map(item => item.price);
        
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = prices;
        this.chart.update('none');
        
        // Mark last point as current time
        console.log(`📍 چارت پوینت به‌روزرسانی شد: ${this.pointHistory.length} نقطه، آخرین قیمت: ${prices[prices.length - 1]?.toFixed(6) || '0'}`);
    }

    // Add current price point for real-time updates - MAINTAINS CONTINUITY
    addCurrentPricePoint(currentPrice) {
        const now = new Date();
        const nowTimestamp = now.getTime();
        
        // CRITICAL: Never add future data
        if (nowTimestamp > Date.now()) {
            console.warn('🚫 سعی در اضافه کردن داده پوینت آینده - رد شد');
            return;
        }
        
        // CONTINUITY: Never allow zero prices unless they're genuine
        if (currentPrice === 0 || currentPrice === null || currentPrice === undefined) {
            console.warn('🚫 قیمت پوینت صفر یا نامعتبر - حفظ آخرین قیمت');
            return;
        }
        
        // Add new point with current time and price
        const newPoint = {
            time: now,
            price: currentPrice,
            timestamp: nowTimestamp
        };
        
        // Maintain chart continuity
        if (this.pointHistory.length > 0) {
            const lastPoint = this.pointHistory[this.pointHistory.length - 1];
            const timeDiff = nowTimestamp - lastPoint.timestamp;
            
            // If significant time has passed, maintain continuity by extending last price
            if (timeDiff > 60000) { // More than 1 minute
                // Fill gap with continuous line (last price until new price)
                const gapFillTime = new Date(lastPoint.timestamp + 30000); // 30 seconds later
                if (gapFillTime.getTime() < nowTimestamp) {
                    this.pointHistory.push({
                        time: gapFillTime,
                        price: lastPoint.price, // Keep last price
                        timestamp: gapFillTime.getTime(),
                        isContinuity: true
                    });
                }
            }
            
            // Add the new real price point
            this.pointHistory.push(newPoint);
            console.log(`➕ نقطه جدید پوینت اضافه شد: ${currentPrice.toFixed(6)} در ${now.toLocaleTimeString('fa-IR')}`);
        } else {
            // First point
            this.pointHistory.push(newPoint);
            console.log(`🥇 اولین نقطه پوینت اضافه شد: ${currentPrice.toFixed(6)} در ${now.toLocaleTimeString('fa-IR')}`);
        }
        
        // DOUBLE CHECK: Remove any future points and maintain order
        this.pointHistory = this.pointHistory
            .filter(point => point.timestamp <= Date.now())
            .sort((a, b) => a.timestamp - b.timestamp);
    }

    formatPriceScientific(price) {
        if (price === 0 || price === '0') return '0';
        const numPrice = parseFloat(price);
        if (isNaN(numPrice)) return price;
        if (numPrice < 0.000001) {
            return numPrice.toExponential(6);
        }
        return numPrice.toFixed(6);
    }

    getPersistentHistory() {
        try {
            const saved = localStorage.getItem('pointPriceHistory');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    savePersistentHistory() {
        try {
            localStorage.setItem('pointPriceHistory', JSON.stringify(this.pointHistory));
        } catch (e) {
            console.error('Error saving point price history:', e);
        }
    }

    loadPersistentHistory() {
        this.pointHistory = this.getPersistentHistory();
    }
}

// Helper functions for testing and debugging
window.testPointChart = async function() {
    console.log('🧪 تست چارت پوینت...');
    
    if (!window.pointChart) {
        console.error('❌ چارت پوینت وجود ندارد');
        return;
    }
    
    console.log('📊 وضعیت چارت پوینت:');
    console.log('- Chart initialized:', !!window.pointChart.chart);
    console.log('- Point history length:', window.pointChart.pointHistory.length);
    console.log('- Contract available:', !!(window.contractConfig && window.contractConfig.contract));
    console.log('- PriceHistoryManager:', !!window.priceHistoryManager);
    
    if (window.priceHistoryManager) {
        console.log('- Point history length:', window.priceHistoryManager.pointHistory.length);
        console.log('- Firebase enabled:', window.priceHistoryManager.isFirebaseEnabled());
    }
    
    // Force update
    await window.pointChart.generateTimePeriodData();
    console.log('✅ چارت پوینت به‌روزرسانی شد');
};

window.refreshPointChart = async function() {
    console.log('🔄 بازخوانی چارت پوینت...');
    if (window.pointChart) {
        await window.pointChart.generateTimePeriodData();
        console.log('✅ چارت پوینت بازخوانی شد');
    }
};

// Initialize point chart when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof Chart !== 'undefined') {
        window.pointChart = new PointChart();
    }
}); 