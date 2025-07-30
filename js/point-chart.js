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

    generateTimePeriodData() {
        // Try to get real data from Firebase first
        if (window.priceHistoryManager && window.priceHistoryManager.pointHistory && window.priceHistoryManager.pointHistory.length > 0) {
            console.log('📊 استفاده از داده‌های واقعی Firebase برای چارت پوینت');
            this.pointHistory = window.priceHistoryManager.pointHistory.slice(-24); // Last 24 records
            this.updateChart();
            return;
        }

        // Fallback to simulated data if no real data available
        console.log('📊 استفاده از داده‌های شبیه‌سازی شده برای چارت پوینت');
        
        const now = Date.now();
        const period = this.currentTimePeriod;
        let dataPoints = 24;
        let interval = 60 * 60 * 1000; // 1 hour default

        switch (period) {
            case 'day':
                dataPoints = 24;
                interval = 60 * 60 * 1000; // 1 hour
                break;
            case 'week':
                dataPoints = 7;
                interval = 24 * 60 * 60 * 1000; // 1 day
                break;
            case 'month':
                dataPoints = 30;
                interval = 24 * 60 * 60 * 1000; // 1 day
                break;
            case 'year':
                dataPoints = 12;
                interval = 30 * 24 * 60 * 60 * 1000; // 30 days
                break;
        }

        this.pointHistory = [];
        for (let i = 0; i < dataPoints; i++) {
            const timestamp = now - (dataPoints - i - 1) * interval;
            const price = this.generateSimulatedPrice(timestamp);
            this.pointHistory.push({
                time: new Date(timestamp),
                price: price
            });
        }

        this.updateChart();
    }

    generateSimulatedPrice(timestamp) {
        // Return 0 for simulated prices - will be replaced with real data
        return 0;
    }

    initializeChart() {
        const ctx = document.getElementById('point-chart-canvas');
        if (!ctx) {
            console.warn('⚠️ المنت point-chart-canvas پیدا نشد، چارت ساخته نمی‌شود');
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
        // Generate initial data for current time period
        this.generateTimePeriodData();
        
        // Initial update
        await this.updatePoint();
        
        // Update point price every 30 seconds
        setInterval(async () => {
            await this.updatePoint();
        }, 30000);
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
            
            // Update chart data only if chart is properly initialized
            if (this.chart && this.chart.data && this.chart.data.datasets) {
                this.generateTimePeriodData();
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
        
        const labels = this.pointHistory.map((point, index) => {
            const period = this.currentTimePeriod;
            if (period === 'day') {
                return `${index}:00`;
            } else if (period === 'week') {
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                return days[index] || '';
            } else if (period === 'month') {
                return `${index + 1}`;
            } else if (period === 'year') {
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return months[index] || '';
            }
            return '';
        });
        
        const data = this.pointHistory.map(point => point.price);
        
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = data;
        this.chart.update('none');
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

// Initialize point chart when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof Chart !== 'undefined') {
        window.pointChart = new PointChart();
    }
}); 