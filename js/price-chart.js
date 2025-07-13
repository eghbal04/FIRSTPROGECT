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
        const period = this.currentTimePeriod;
        const now = new Date();
        let dataPoints = [];
        const realPrices = window.priceHistoryManager ? 
            window.priceHistoryManager.getRealPricesUpToNow('token', period) : 
            Array(period === 'day' ? 24 : period === 'week' ? 7 : period === 'month' ? 30 : 12).fill(0);
        if (period === 'day') {
            const currentHour = now.getHours();
            for (let i = 0; i < 24; i++) {
                const hour = new Date(now);
                hour.setHours(i, 0, 0, 0);
                dataPoints.push({
                    time: hour.getTime(),
                    price: (i <= currentHour) ? (realPrices[i] || 0) : null
                });
            }
        } else if (period === 'week') {
            const today = new Date();
            const dayOfWeek = today.getDay();
            for (let i = 0; i < 7; i++) {
                const d = new Date(today);
                d.setDate(today.getDate() - dayOfWeek + i);
                d.setHours(12, 0, 0, 0);
                dataPoints.push({
                    time: d.getTime(),
                    price: (i <= dayOfWeek) ? (realPrices[i] || 0) : null
                });
            }
        } else if (period === 'month') {
            const today = new Date();
            const currentDay = today.getDate();
            for (let i = 0; i < 30; i++) {
                const d = new Date(today);
                d.setDate(i + 1);
                d.setHours(12, 0, 0, 0);
                dataPoints.push({
                    time: d.getTime(),
                    price: (i < currentDay) ? (realPrices[i] || 0) : null
                });
            }
        } else if (period === 'year') {
            const today = new Date();
            const currentMonth = today.getMonth();
            for (let i = 0; i < 12; i++) {
                const d = new Date(today);
                d.setMonth(i);
                d.setDate(15);
                d.setHours(12, 0, 0, 0);
                dataPoints.push({
                    time: d.getTime(),
                    price: (i <= currentMonth) ? (realPrices[i] || 0) : null
                });
            }
        }
        this.priceHistory = dataPoints;
        this.updateChart();
    }

    generateSimulatedPrice(timestamp) {
        // Return 0 for simulated prices - will be replaced with real data
        return 0;
    }

    initializeChart() {
        const ctx = document.getElementById('price-chart-canvas');
        if (!ctx) return;

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
                                } else if (period === 'day') {
                                    return index + 1;
                                } else if (period === 'month') {
                                    return index + 1;
                                } else if (period === 'year') {
                                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                    return months[index] || '';
                                }
                                return '';
                            }
                        }
                    },
                    y: {
                        display: true,
                        position: 'right',
                        grid: {
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
    }

    async startPriceUpdates() {

        // Generate initial data for current time period
        this.generateTimePeriodData();
        
        // Update price every 30 seconds
        setInterval(async () => {
    
            await this.updatePrice();
        }, 30000);
    }

    async updatePrice() {
        try {
            if (window.priceHistoryManager) {
                await window.priceHistoryManager.updateTokenPrice();
                this.generateTimePeriodData();
            }
        } catch (error) {
            console.error('Error updating token price:', error);
        }
    }

    updateChart() {
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