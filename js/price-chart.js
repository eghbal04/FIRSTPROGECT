// Price Chart Module with Chart.js Line Charts
let priceChartInterval = null;
let priceHistory = {
    lvlUsd: [],
    lvlPol: [],
    polUsd: []
};

let chartInstance = null;
let currentTimePeriod = '24h'; // Default to 24 hours
let timePeriods = {
    '24h': { label: '24 ساعت', hours: 24, interval: 30000 }, // 30 seconds
    '7d': { label: '7 روز', hours: 168, interval: 300000 }, // 5 minutes
    '1m': { label: '1 ماه', hours: 720, interval: 900000 }, // 15 minutes
    '1y': { label: '1 سال', hours: 8760, interval: 3600000 } // 1 hour
};

// Initialize price chart
async function initializePriceChart() {
    try {
        console.log('Price Chart: Initializing...');
        
        // Load Chart.js if not already loaded
        await loadChartJS();
        
        // Initialize the chart
        initializeChart();
        
        // Setup time period buttons
        setupTimePeriodButtons();
        
        // Load initial prices
        await updatePriceChart();
        
        // Start auto-update with current period interval
        startAutoUpdate();
        
        console.log('Price Chart: Initialized successfully');
        
    } catch (error) {
        console.error('Price Chart: Error initializing:', error);
        showPriceChartError('خطا در راه‌اندازی چارت قیمت');
    }
}

// Setup time period filter buttons
function setupTimePeriodButtons() {
    const container = document.getElementById('price-chart-time-filters');
    if (!container) return;
    
    container.innerHTML = '';
    
    Object.entries(timePeriods).forEach(([period, config]) => {
        const button = document.createElement('button');
        button.className = `time-period-btn ${period === currentTimePeriod ? 'active' : ''}`;
        button.textContent = config.label;
        button.onclick = () => changeTimePeriod(period);
        container.appendChild(button);
    });
}

// Change time period
async function changeTimePeriod(period) {
    try {
        console.log('Price Chart: Changing time period to:', period);
        
        // Update current period
        currentTimePeriod = period;
        
        // Update button states
        updateTimePeriodButtons();
        
        // Restart auto-update with new interval
        startAutoUpdate();
        
        // Update chart with new data
        await updatePriceChart();
        
        console.log('Price Chart: Time period changed successfully');
        
    } catch (error) {
        console.error('Price Chart: Error changing time period:', error);
        showPriceChartError('خطا در تغییر بازه زمانی');
    }
}

// Update time period button states
function updateTimePeriodButtons() {
    const buttons = document.querySelectorAll('.time-period-btn');
    buttons.forEach(button => {
        button.classList.remove('active');
        if (button.textContent === timePeriods[currentTimePeriod].label) {
            button.classList.add('active');
        }
    });
    
    // Update current period display
    const currentPeriodElement = document.getElementById('chart-current-period');
    if (currentPeriodElement) {
        currentPeriodElement.textContent = timePeriods[currentTimePeriod].label;
    }
}

// Start auto-update with current period interval
function startAutoUpdate() {
    // Stop existing interval
    if (priceChartInterval) {
        clearInterval(priceChartInterval);
    }
    
    // Start new interval with current period settings
    const interval = timePeriods[currentTimePeriod].interval;
    priceChartInterval = setInterval(updatePriceChart, interval);
    
    console.log('Price Chart: Auto-update started with interval:', interval);
}

// Load Chart.js dynamically
async function loadChartJS() {
    if (window.Chart) {
        return;
    }
    
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
        script.onload = () => {
            console.log('Chart.js loaded successfully');
            resolve();
        };
        script.onerror = () => {
            console.error('Failed to load Chart.js');
            reject(new Error('Failed to load Chart.js'));
        };
        document.head.appendChild(script);
    });
}

// Initialize the line chart
function initializeChart() {
    const ctx = document.getElementById('price-chart-canvas');
    if (!ctx) {
        console.error('Price Chart: Canvas element not found');
        return;
    }
    
    // Destroy existing chart if any
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'قیمت LVL (USD)',
                    data: [],
                    borderColor: '#00ff88',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 6
                },
                {
                    label: 'قیمت LVL (POL)',
                    data: [],
                    borderColor: '#00ccff',
                    backgroundColor: 'rgba(0, 204, 255, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 6
                },
                {
                    label: 'قیمت POL (USD)',
                    data: [],
                    borderColor: '#ff6b6b',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 6
                }
            ]
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
                    position: 'top',
                    labels: {
                        color: '#ffffff',
                        font: {
                            size: 12,
                            family: 'Tahoma, Arial, sans-serif'
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#00ff88',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        title: function(context) {
                            const date = new Date(context[0].parsed.x);
                            return date.toLocaleString('fa-IR', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            });
                        },
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('en-US', {
                                    minimumFractionDigits: 6,
                                    maximumFractionDigits: 6
                                }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'زمان',
                        color: '#ffffff',
                        font: {
                            size: 12,
                            family: 'Tahoma, Arial, sans-serif'
                        }
                    },
                    ticks: {
                        color: '#cccccc',
                        maxTicksLimit: 8,
                        callback: function(value, index, values) {
                            const date = new Date(this.getLabelForValue(value));
                            const period = currentTimePeriod;
                            
                            if (period === '24h') {
                                return date.toLocaleTimeString('fa-IR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                });
                            } else if (period === '7d') {
                                return date.toLocaleDateString('fa-IR', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit'
                                });
                            } else if (period === '1m') {
                                return date.toLocaleDateString('fa-IR', {
                                    month: 'short',
                                    day: 'numeric'
                                });
                            } else {
                                return date.toLocaleDateString('fa-IR', {
                                    year: 'numeric',
                                    month: 'short'
                                });
                            }
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'قیمت',
                        color: '#ffffff',
                        font: {
                            size: 12,
                            family: 'Tahoma, Arial, sans-serif'
                        }
                    },
                    ticks: {
                        color: '#cccccc',
                        callback: function(value, index, values) {
                            return new Intl.NumberFormat('en-US', {
                                minimumFractionDigits: 6,
                                maximumFractionDigits: 6
                            }).format(value);
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            elements: {
                point: {
                    hoverBackgroundColor: '#ffffff'
                }
            }
        }
    });
    
    console.log('Price Chart: Chart initialized');
}

// Update price chart data
async function updatePriceChart() {
    try {
        console.log('Price Chart: Updating prices...');
        
        // Get prices from contract
        const prices = await window.getPrices();
        
        // Add to history (keep data based on current time period)
        const timestamp = Date.now();
        
        priceHistory.lvlUsd.push({
            time: timestamp,
            value: parseFloat(prices.lvlPriceUSD)
        });
        
        priceHistory.lvlPol.push({
            time: timestamp,
            value: parseFloat(prices.lvlPricePol)
        });
        
        priceHistory.polUsd.push({
            time: timestamp,
            value: parseFloat(prices.polPrice)
        });
        
        // Keep only data within current time period
        const periodHours = timePeriods[currentTimePeriod].hours;
        const cutoffTime = timestamp - (periodHours * 60 * 60 * 1000);
        
        priceHistory.lvlUsd = priceHistory.lvlUsd.filter(item => item.time >= cutoffTime);
        priceHistory.lvlPol = priceHistory.lvlPol.filter(item => item.time >= cutoffTime);
        priceHistory.polUsd = priceHistory.polUsd.filter(item => item.time >= cutoffTime);
        
        // Update chart data
        updateChartData();
        
        // Update price cards
        updatePriceCards(prices);
        
        // Calculate and display price changes
        updatePriceChanges();
        
        console.log('Price Chart: Updated successfully');
        
    } catch (error) {
        console.error('Price Chart: Error updating prices:', error);
        showPriceChartError('خطا در به‌روزرسانی قیمت‌ها');
    }
}

// Update chart data
function updateChartData() {
    if (!chartInstance) return;
    
    // Prepare labels (time) based on current period
    const labels = priceHistory.lvlUsd.map(item => {
        const date = new Date(item.time);
        const period = currentTimePeriod;
        
        if (period === '24h') {
            return date.toLocaleTimeString('fa-IR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else if (period === '7d') {
            return date.toLocaleDateString('fa-IR', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit'
            });
        } else if (period === '1m') {
            return date.toLocaleDateString('fa-IR', {
                month: 'short',
                day: 'numeric'
            });
        } else {
            return date.toLocaleDateString('fa-IR', {
                year: 'numeric',
                month: 'short'
            });
        }
    });
    
    // Prepare datasets
    const lvlUsdData = priceHistory.lvlUsd.map(item => item.value);
    const lvlPolData = priceHistory.lvlPol.map(item => item.value);
    const polUsdData = priceHistory.polUsd.map(item => item.value);
    
    // Update chart
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = lvlUsdData;
    chartInstance.data.datasets[1].data = lvlPolData;
    chartInstance.data.datasets[2].data = polUsdData;
    
    chartInstance.update('none'); // Update without animation for better performance
}

// Update price cards
function updatePriceCards(prices) {
    try {
        // Format prices
        const lvlUsdFormatted = formatPrice(prices.lvlPriceUSD, 6);
        const lvlPolFormatted = formatPrice(prices.lvlPricePol, 6);
        const polUsdFormatted = formatPrice(prices.polPrice, 4);
        
        // Update price values
        updateElement('chart-lvl-usd', lvlUsdFormatted, '$');
        updateElement('chart-lvl-pol', lvlPolFormatted, '', ' POL');
        updateElement('chart-pol-usd', polUsdFormatted, '$');
        
        // Update last update time
        const now = new Date();
        const timeString = now.toLocaleTimeString('fa-IR');
        updateElement('chart-last-update', timeString);
        
    } catch (error) {
        console.error('Price Chart: Error updating price cards:', error);
    }
}

// Calculate and display price changes
function updatePriceChanges() {
    try {
        // Calculate changes for LVL/USD
        const lvlUsdChange = calculatePriceChange(priceHistory.lvlUsd);
        updatePriceChangeElement('chart-lvl-usd-change', lvlUsdChange);
        
        // Calculate changes for LVL/POL
        const lvlPolChange = calculatePriceChange(priceHistory.lvlPol);
        updatePriceChangeElement('chart-lvl-pol-change', lvlPolChange);
        
        // Calculate changes for POL/USD
        const polUsdChange = calculatePriceChange(priceHistory.polUsd);
        updatePriceChangeElement('chart-pol-usd-change', polUsdChange);
        
    } catch (error) {
        console.error('Price Chart: Error calculating price changes:', error);
    }
}

// Calculate price change percentage
function calculatePriceChange(priceArray) {
    if (priceArray.length < 2) return 0;
    
    const current = priceArray[priceArray.length - 1].value;
    const previous = priceArray[priceArray.length - 2].value;
    
    if (previous === 0) return 0;
    
    return ((current - previous) / previous) * 100;
}

// Update price change element with color coding
function updatePriceChangeElement(elementId, changePercent) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const changeText = changePercent >= 0 ? 
        `+${changePercent.toFixed(2)}%` : 
        `${changePercent.toFixed(2)}%`;
    
    element.textContent = changeText;
    
    // Remove existing classes
    element.classList.remove('price-up', 'price-down', 'price-neutral');
    
    // Add appropriate class
    if (changePercent > 0) {
        element.classList.add('price-up');
    } else if (changePercent < 0) {
        element.classList.add('price-down');
    } else {
        element.classList.add('price-neutral');
    }
}

// Format price with specified decimals
function formatPrice(price, decimals = 4) {
    try {
        const num = parseFloat(price);
        if (isNaN(num)) return '0';
        
        return num.toFixed(decimals);
    } catch (error) {
        console.error('Price Chart: Error formatting price:', error);
        return '0';
    }
}

// Update element helper function
function updateElement(id, value, prefix = '', suffix = '') {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = prefix + value + suffix;
    }
}

// Show price chart error
function showPriceChartError(message) {
    const errorElement = document.getElementById('price-chart-error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Hide error after 5 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}

// Show price chart success
function showPriceChartSuccess(message) {
    const successElement = document.getElementById('price-chart-success');
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';
        
        // Hide success after 3 seconds
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 3000);
    }
}

// Stop price chart updates
function stopPriceChart() {
    if (priceChartInterval) {
        clearInterval(priceChartInterval);
        priceChartInterval = null;
        console.log('Price Chart: Stopped auto-updates');
    }
    
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
        console.log('Price Chart: Chart destroyed');
    }
}

// Manual refresh function
async function refreshPriceChart() {
    try {
        console.log('Price Chart: Manual refresh requested');
        await updatePriceChart();
        showPriceChartSuccess('قیمت‌ها به‌روزرسانی شدند');
    } catch (error) {
        console.error('Price Chart: Error in manual refresh:', error);
        showPriceChartError('خطا در به‌روزرسانی دستی');
    }
}

// Export functions for global use
window.priceChart = {
    initialize: initializePriceChart,
    stop: stopPriceChart,
    refresh: refreshPriceChart,
    update: updatePriceChart,
    changeTimePeriod: changeTimePeriod
};

console.log('Price Chart module loaded successfully'); 