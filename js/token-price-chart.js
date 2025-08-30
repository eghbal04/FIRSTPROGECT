// Token Price Chart Manager
class TokenPriceChartManager {
    constructor() {
        this.chart = null;
        this.chartData = [];
        this.currentTimeRange = '30d';
        this.currentChartType = 'line';
        this.initialPrice = 0.000001; // Initial IAM token price in DAI
        this.isInitialized = false;
    }

    async initialize() {
        try {
            console.log('📈 Initializing Token Price Chart Manager...');
            
            // Wait for Chart.js to be available
            if (typeof Chart === 'undefined') {
                await this.loadChartJS();
            }
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load initial data
            await this.loadChartData();
            
            this.isInitialized = true;
            console.log('✅ Token Price Chart Manager initialized');
            
        } catch (error) {
            console.error('❌ Error initializing Token Price Chart Manager:', error);
        }
    }

    async loadChartJS() {
        return new Promise((resolve, reject) => {
            if (typeof Chart !== 'undefined') {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
            script.onload = () => {
                console.log('✅ Chart.js loaded');
                resolve();
            };
            script.onerror = () => {
                console.error('❌ Failed to load Chart.js');
                reject(new Error('Failed to load Chart.js'));
            };
            document.head.appendChild(script);
        });
    }

    setupEventListeners() {
        // Time range selector
        const timeRangeSelect = document.getElementById('chart-time-range');
        if (timeRangeSelect) {
            timeRangeSelect.addEventListener('change', (e) => {
                this.currentTimeRange = e.target.value;
                this.loadChartData();
            });
        }

        // Chart type selector
        const chartTypeSelect = document.getElementById('chart-type');
        if (chartTypeSelect) {
            chartTypeSelect.addEventListener('change', (e) => {
                this.currentChartType = e.target.value;
                this.updateChartType();
            });
        }
    }

    async loadChartData() {
        try {
            console.log('📊 Loading chart data for range:', this.currentTimeRange);
            
            // Show loading state
            this.updateLoadingState(true);
            
            // Generate sample data based on time range
            const data = await this.generateSampleData();
            
            this.chartData = data;
            
            // Update statistics
            this.updateStatistics();
            
            // Render chart
            this.renderChart();
            
            // Update current price
            await this.updateCurrentPrice();
            
            console.log('✅ Chart data loaded successfully');
            
        } catch (error) {
            console.error('❌ Error loading chart data:', error);
            this.showError('Failed to load chart data');
        } finally {
            this.updateLoadingState(false);
        }
    }

    async generateSampleData() {
        const now = new Date();
        const data = [];
        
        // Determine number of data points based on time range
        let days, interval;
        switch (this.currentTimeRange) {
            case '7d':
                days = 7;
                interval = 1; // 1 day intervals
                break;
            case '30d':
                days = 30;
                interval = 1; // 1 day intervals
                break;
            case '90d':
                days = 90;
                interval = 3; // 3 day intervals
                break;
            case '1y':
                days = 365;
                interval = 7; // 1 week intervals
                break;
            case 'all':
                days = 730; // 2 years
                interval = 14; // 2 week intervals
                break;
            default:
                days = 30;
                interval = 1;
        }

        // Generate realistic price data with growth trend
        let currentPrice = this.initialPrice;
        const volatility = 0.15; // 15% daily volatility
        const growthRate = 0.001; // 0.1% daily growth on average
        
        for (let i = days; i >= 0; i -= interval) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            // Add some realistic price movement
            const randomChange = (Math.random() - 0.5) * volatility;
            const trendChange = growthRate * interval;
            const totalChange = 1 + randomChange + trendChange;
            
            currentPrice *= totalChange;
            
            // Ensure price doesn't go below initial price
            currentPrice = Math.max(currentPrice, this.initialPrice * 0.5);
            
            data.push({
                date: date.toISOString().split('T')[0],
                price: currentPrice,
                timestamp: date.getTime()
            });
        }
        
        return data;
    }

    renderChart() {
        const canvas = document.getElementById('token-price-chart');
        if (!canvas) {
            console.error('❌ Chart canvas not found');
            return;
        }

        // Destroy existing chart if it exists
        if (this.chart) {
            this.chart.destroy();
        }

        const ctx = canvas.getContext('2d');
        
        // Prepare chart data
        const labels = this.chartData.map(d => d.date);
        const prices = this.chartData.map(d => d.price);
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(0, 255, 136, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 255, 136, 0.0)');

        this.chart = new Chart(ctx, {
            type: this.currentChartType,
            data: {
                labels: labels,
                datasets: [{
                    label: 'IAM Token Price (DAI)',
                    data: prices,
                    borderColor: '#00ff88',
                    backgroundColor: this.currentChartType === 'area' ? gradient : 'rgba(0, 255, 136, 0.1)',
                    borderWidth: 2,
                    fill: this.currentChartType === 'area',
                    pointBackgroundColor: '#00ff88',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(26, 31, 46, 0.9)',
                        titleColor: '#00ff88',
                        bodyColor: '#ffffff',
                        borderColor: '#00ff88',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `Price: ${context.parsed.y.toFixed(6)} DAI`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#888',
                            maxTicksLimit: 8
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#888',
                            callback: function(value) {
                                return value.toFixed(6) + ' DAI';
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                elements: {
                    point: {
                        hoverBackgroundColor: '#00ff88',
                        hoverBorderColor: '#ffffff'
                    }
                }
            }
        });
    }

    updateChartType() {
        if (this.chart && this.chartData.length > 0) {
            this.renderChart();
        }
    }

    updateStatistics() {
        if (this.chartData.length === 0) return;

        const prices = this.chartData.map(d => d.price);
        const initialPrice = prices[0];
        const currentPrice = prices[prices.length - 1];
        const highestPrice = Math.max(...prices);
        const lowestPrice = Math.min(...prices);
        const totalGrowth = ((currentPrice - initialPrice) / initialPrice) * 100;

        // Update DOM elements
        this.updateElement('initial-price', initialPrice.toFixed(6));
        this.updateElement('highest-price', highestPrice.toFixed(6));
        this.updateElement('lowest-price', lowestPrice.toFixed(6));
        this.updateElement('total-growth', `${totalGrowth > 0 ? '+' : ''}${totalGrowth.toFixed(2)}%`);
    }

    async updateCurrentPrice() {
        try {
            // Try to get current price from smart contract
            if (window.contractConfig && window.contractConfig.contract) {
                const tokenPrice = await window.contractConfig.contract.getTokenPrice();
                const currentPrice = parseFloat(ethers.formatUnits(tokenPrice, 18));
                this.updateElement('current-token-price', currentPrice.toFixed(6));
                
                // Calculate 24h change (simulated)
                const yesterdayPrice = currentPrice * (1 + (Math.random() - 0.5) * 0.1);
                const change24h = ((currentPrice - yesterdayPrice) / yesterdayPrice) * 100;
                const changeElement = document.getElementById('price-change-24h');
                if (changeElement) {
                    changeElement.textContent = `${change24h > 0 ? '+' : ''}${change24h.toFixed(2)}%`;
                    changeElement.style.color = change24h >= 0 ? '#00ff88' : '#ff4444';
                }
            } else {
                // Use last price from chart data
                const currentPrice = this.chartData[this.chartData.length - 1]?.price || this.initialPrice;
                this.updateElement('current-token-price', currentPrice.toFixed(6));
            }
        } catch (error) {
            console.warn('⚠️ Error updating current price:', error);
            // Use fallback price
            const currentPrice = this.chartData[this.chartData.length - 1]?.price || this.initialPrice;
            this.updateElement('current-token-price', currentPrice.toFixed(6));
        }
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    updateLoadingState(isLoading) {
        const currentPriceElement = document.getElementById('current-token-price');
        if (currentPriceElement) {
            currentPriceElement.textContent = isLoading ? 'Loading...' : currentPriceElement.textContent;
        }
    }

    showError(message) {
        const currentPriceElement = document.getElementById('current-token-price');
        if (currentPriceElement) {
            currentPriceElement.textContent = 'Error';
            currentPriceElement.style.color = '#ff4444';
        }
        
        // Show error message in chart area
        const canvas = document.getElementById('token-price-chart');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff4444';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(message, canvas.width / 2, canvas.height / 2);
        }
    }

    refresh() {
        this.loadChartData();
    }
}

// Global instance
let tokenChartManager = null;

// Initialize chart manager when page loads
document.addEventListener('DOMContentLoaded', async function() {
    try {
        tokenChartManager = new TokenPriceChartManager();
        await tokenChartManager.initialize();
    } catch (error) {
        console.error('❌ Failed to initialize token chart manager:', error);
    }
});

// Global refresh function
function refreshTokenChart() {
    if (tokenChartManager) {
        tokenChartManager.refresh();
    } else {
        console.warn('⚠️ Token chart manager not initialized');
    }
}

// Auto-refresh chart every 5 minutes
setInterval(() => {
    if (tokenChartManager && tokenChartManager.isInitialized) {
        tokenChartManager.updateCurrentPrice();
    }
}, 5 * 60 * 1000);

// Export for global access
window.refreshTokenChart = refreshTokenChart;
window.tokenChartManager = tokenChartManager;
