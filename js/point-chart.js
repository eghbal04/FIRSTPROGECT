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
        console.log('PointChart init() called');
        this.initializeChart();
        this.setupTimePeriodSelect();
        this.startPointUpdates();
        console.log('PointChart init() completed');
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
        this.loadPersistentHistory();
        const period = this.currentTimePeriod;
        const now = new Date();
        let dataPoints = [];
        const realPrices = window.priceHistoryManager ? 
            window.priceHistoryManager.getRealPricesUpToNow('point', period) : 
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
        this.pointHistory = dataPoints;
        this.updateChart();
    }

    generateSimulatedPrice(timestamp) {
        // Return 0 for simulated prices - will be replaced with real data
        return 0;
    }

    initializeChart() {
        const ctx = document.getElementById('point-chart-canvas');
        if (!ctx) return;

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
    }

    async startPointUpdates() {
        // Update point price every 30 seconds
        setInterval(async () => {
            await this.updatePoint();
        }, 30000);
        
        // Initial update
        await this.updatePoint();
    }

    async updatePoint() {
        try {
            if (!window.contractConfig || !window.contractConfig.contract) {
                return;
            }
            
            const contract = window.contractConfig.contract;
            const pointValue = await contract.getPointValue();
            const pointValueNum = parseFloat(ethers.formatUnits(pointValue, 18));
            
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
            
            // Update chart data
            this.generateTimePeriodData();
            
        } catch (error) {
            console.error('Error updating point price:', error);
        }
    }

    updateChart() {
        if (!this.chart) return;
        
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