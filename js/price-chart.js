// Price Chart Implementation - Simple Line Only
class PriceChart {
    constructor() {
        this.chart = null;
        this.priceHistory = [];
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
        this.setupTimePeriodButtons();
        this.startPriceUpdates();

    }

    setupTimePeriodButtons() {
        const select = document.getElementById('token-period-select');
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
        const select = document.getElementById('token-period-select');
        if (select) select.value = period;
        this.generateTimePeriodData();
        if (typeof updatePriceStats === 'function') updatePriceStats();
    }

    generateTimePeriodData() {
        // Try to get real data from Firebase first
        if (window.priceHistoryManager && window.priceHistoryManager.tokenHistory && window.priceHistoryManager.tokenHistory.length > 0) {
            console.log('📊 استفاده از داده‌های واقعی Firebase برای چارت توکن');
            this.priceHistory = window.priceHistoryManager.tokenHistory.slice(-24); // Last 24 records
            this.updateChart();
            return;
        }

        // Fallback to simulated data if no real data available
        console.log('📊 استفاده از داده‌های شبیه‌سازی شده برای چارت توکن');
        
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

        this.priceHistory = [];
        for (let i = 0; i < dataPoints; i++) {
            const timestamp = now - (dataPoints - i - 1) * interval;
            const price = this.generateSimulatedPrice(timestamp);
            this.priceHistory.push({
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
        const ctx = document.getElementById('price-chart-canvas');
        if (!ctx) {
            console.warn('⚠️ المنت price-chart-canvas پیدا نشد، چارت ساخته نمی‌شود');
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
                        label: 'CPA',
                        data: [],
                        borderColor: '#00ff88',
                        backgroundColor: 'rgba(0, 255, 136, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 3,
                        pointBackgroundColor: '#00ff88',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: '#00ff88',
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
                            titleColor: '#00ff88',
                            bodyColor: '#fff',
                            borderColor: '#00ff88',
                            borderWidth: 1,
                            cornerRadius: 8,
                            displayColors: false,
                            callbacks: {
                                title: function(context) {
                                    const dataIndex = context[0].dataIndex;
                                    const period = window.priceChart?.currentTimePeriod || 'day';
                                    const timestamp = window.priceChart?.priceHistory?.[dataIndex]?.time;
                                    
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
                                    const value = context.parsed.y;
                                    if (value < 0.000001) {
                                        return `Price: ${value.toExponential(6)}`;
                                    }
                                    return `Price: ${value.toFixed(6)}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            display: true,
                            grid: {
                                display: true,
                                color: 'rgba(0, 255, 136, 0.1)',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#00ff88',
                                font: {
                                    size: 10,
                                    family: 'monospace'
                                },
                                callback: function(value, index) {
                                    const period = window.priceChart?.currentTimePeriod || 'day';
                                    if (period === 'week') {
                                        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                                        return days[index] || '';
                                    } else if (period === 'month') {
                                        return (index + 1).toString();
                                    } else if (period === 'year') {
                                        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                        return months[index] || '';
                                    } else {
                                        return index.toString();
                                    }
                                }
                            }
                        },
                        y: {
                            display: true,
                            grid: {
                                display: true,
                                color: 'rgba(0, 255, 136, 0.1)',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#00ff88',
                                font: {
                                    size: 10,
                                    family: 'monospace'
                                },
                                callback: function(value) {
                                    if (value < 0.000001) {
                                        return value.toExponential(3);
                                    }
                                    return value.toFixed(6);
                                }
                            }
                        }
                    },
                    elements: {
                        point: {
                            radius: 3
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
                            label: 'CPA',
                            data: [],
                            borderColor: '#00ff88',
                            backgroundColor: 'rgba(0, 255, 136, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 3,
                            pointBackgroundColor: '#00ff88',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointHoverRadius: 6,
                            pointHoverBackgroundColor: '#00ff88',
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
                                titleColor: '#00ff88',
                                bodyColor: '#fff',
                                borderColor: '#00ff88',
                                borderWidth: 1,
                                cornerRadius: 8,
                                displayColors: false,
                                callbacks: {
                                    title: function(context) {
                                        const dataIndex = context[0].dataIndex;
                                        const period = window.priceChart?.currentTimePeriod || 'day';
                                        const timestamp = window.priceChart?.priceHistory?.[dataIndex]?.time;
                                        
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
                                        const value = context.parsed.y;
                                        if (value < 0.000001) {
                                            return `Price: ${value.toExponential(6)}`;
                                        }
                                        return `Price: ${value.toFixed(6)}`;
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                display: true,
                                grid: {
                                    display: true,
                                    color: 'rgba(0, 255, 136, 0.1)',
                                    drawBorder: false
                                },
                                ticks: {
                                    color: '#00ff88',
                                    font: {
                                        size: 10,
                                        family: 'monospace'
                                    },
                                    callback: function(value, index) {
                                        const period = window.priceChart?.currentTimePeriod || 'day';
                                        if (period === 'week') {
                                            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                                            return days[index] || '';
                                        } else if (period === 'month') {
                                            return (index + 1).toString();
                                        } else if (period === 'year') {
                                            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                            return months[index] || '';
                                        } else {
                                            return index.toString();
                                        }
                                    }
                                }
                            },
                            y: {
                                display: true,
                                grid: {
                                    display: true,
                                    color: 'rgba(0, 255, 136, 0.1)',
                                    drawBorder: false
                                },
                                ticks: {
                                    color: '#00ff88',
                                    font: {
                                        size: 10,
                                        family: 'monospace'
                                    },
                                    callback: function(value) {
                                        if (value < 0.000001) {
                                            return value.toExponential(3);
                                        }
                                        return value.toFixed(6);
                                    }
                                }
                            }
                        },
                        elements: {
                            point: {
                                radius: 3
                            }
                        }
                    }
                });
            } else {
                throw e;
            }
        }
    }

    async startPriceUpdates() {
        // Generate initial data for current time period
        this.generateTimePeriodData();
        
        // Initial update
        await this.updatePrice();
        
        // Update price every 30 seconds
        setInterval(async () => {
            await this.updatePrice();
        }, 30000);
    }

    async updatePrice() {
        try {
            if (!window.contractConfig || !window.contractConfig.contract) {
                console.log('⏳ منتظر اتصال به قرارداد...');
                return;
            }
            
            const contract = window.contractConfig.contract;
            console.log('💲 دریافت قیمت توکن از قرارداد...');
            
            const tokenPrice = await contract.getTokenPrice();
            const tokenPriceNum = parseFloat(ethers.formatUnits(tokenPrice, 18));
            
            console.log('✅ قیمت توکن دریافت شد:', tokenPriceNum);
            
            // Update current price display
            const priceDisplay = document.getElementById('current-price-display');
            if (priceDisplay) {
                priceDisplay.textContent = window.priceHistoryManager ? 
                    window.priceHistoryManager.formatPrice(tokenPriceNum) : 
                    tokenPriceNum.toFixed(6);
            }
            
            // Add to history manager
            if (window.priceHistoryManager) {
                await window.priceHistoryManager.addTokenPrice(tokenPriceNum);
            }
            
            // Update chart data only if chart is properly initialized
            if (this.chart && this.chart.data && this.chart.data.datasets) {
                this.generateTimePeriodData();
                this.updateChart();
            } else {
                console.log('⏳ چارت هنوز آماده نیست، منتظر راه‌اندازی...');
            }
            
        } catch (error) {
            console.error('❌ خطا در به‌روزرسانی قیمت توکن:', error);
        }
    }

    updateChart() {
        const ctx = document.getElementById('price-chart-canvas');
        if (!ctx) {
            console.warn('⚠️ المنت price-chart-canvas برای آپدیت پیدا نشد');
            return;
        }
        if (!this.chart || this.priceHistory.length === 0) return;

        const labels = this.priceHistory.map((_, index) => index);
        const prices = this.priceHistory.map(item => item.price);

        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = prices;
        this.chart.update('none');
    }

    // Helper function to format price in scientific notation
    formatPriceScientific(price) {
        if (price === 0) return '0';
        if (price < 0.000001) {
            return price.toExponential(6);
        }
        return price.toFixed(6);
    }


}

// Initialize chart when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {

    window.priceChart = new PriceChart();

});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PriceChart;
} 