// Price Chart Module with Chart.js Line Charts
let priceChartInterval = null;
let contractStatsInterval = null;
let priceHistory = {
    lvlUsd: [],
    lvlPol: [],
    polUsd: []
};
let chartInstance = null;
let currentTimePeriod = '1D';
let timePeriods = {
    '1D': { label: '24 ساعت', hours: 24, interval: 5000 },
    '7D': { label: '7 روز', hours: 168, interval: 30000 },
    '1M': { label: '1 ماه', hours: 720, interval: 300000 },
    '1Y': { label: '1 سال', hours: 8760, interval: 900000 }
};
let updateIntervals = [];

// Initialize price chart
async function initializePriceChart() {
    try {
        // Initialize the chart
        initializeChart();
        
        // Setup time period buttons
        setupTimePeriodButtons();
        
        // Load initial prices
        await fetchContractStats();
        await updatePriceChart();
        
        // Start auto-update with current period interval
        startChartIntervals();
        
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
        if (!timePeriods[period]) {
            console.warn('Price Chart: Invalid time period:', period);
            return;
        }
        
        currentTimePeriod = period;
        updateTimePeriodButtons();
        
        // به‌روزرسانی نمودار با داده‌های فیلتر شده
        if (chartInstance && priceHistory.lvlUsd.length > 0) {
            const timestamp = Date.now();
            const periodHours = timePeriods[period].hours;
            const periodCutoff = timestamp - (periodHours * 60 * 60 * 1000);
            
            const filteredLvlUsd = priceHistory.lvlUsd.filter(item => item.time >= periodCutoff);
            const filteredLvlPol = priceHistory.lvlPol.filter(item => item.time >= periodCutoff);
            const filteredPolUsd = priceHistory.polUsd.filter(item => item.time >= periodCutoff);
            
            // نمایش مختصر تاریخ/ساعت
            let labels;
            if (period === '1D') {
                labels = filteredLvlUsd.map(item => {
                    const d = new Date(item.time);
                    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
                });
            } else {
                labels = filteredLvlUsd.map(item => {
                    const d = new Date(item.time);
                    return (d.getMonth()+1).toString().padStart(2, '0') + '/' + d.getDate().toString().padStart(2, '0');
                });
            }
            chartInstance.data.labels = labels;
            chartInstance.data.datasets[0].data = filteredLvlUsd.map(item => item.value);
            chartInstance.data.datasets[1].data = filteredLvlPol.map(item => item.value);
            chartInstance.data.datasets[2].data = filteredPolUsd.map(item => item.value);
            
            chartInstance.update();
        }
        
        console.log('Price Chart: Time period changed to:', period);
        
    } catch (error) {
        console.error('Price Chart: Error changing time period:', error);
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
function startChartIntervals() {
    // پاک کردن interval های قبلی
    updateIntervals.forEach(interval => clearInterval(interval));
    updateIntervals = [];
    
    // شروع interval های جدید
    const priceUpdateInterval = setInterval(updatePriceChart, 5000); // هر 5 ثانیه
    const contractUpdateInterval = setInterval(async () => {
        try {
            await updatePriceChart();
        } catch (error) {
            console.error('Price Chart: Error in contract update interval:', error);
        }
    }, 300000); // هر 5 دقیقه
    
    updateIntervals.push(priceUpdateInterval, contractUpdateInterval);
    
    console.log('Price Chart: Intervals started');
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
            resolve();
        };
        script.onerror = () => {
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
                    label: ' LVL (USD)',
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
                    label: ' LVL (POL)',
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
                    label: ' POL (USD)',
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
}

// Update price chart data
async function updatePriceChart() {
    try {
        // دریافت قیمت‌ها از تابع مرکزی
        const prices = await window.getPrices();
        
        if (!prices) {
            return;
        }
        
        // تبدیل قیمت‌ها به اعداد
        const priceData = {
            lvlPol: parseFloat(prices.lvlPricePol),
            lvlUsd: parseFloat(prices.lvlPriceUSD),
            polUsd: parseFloat(prices.polPrice)
        };
        
        // به‌روزرسانی کارت‌های قیمت
        updatePriceCards(priceData);
        
        // به‌روزرسانی نمودار
        updateChartData(priceData);
        
    } catch (error) {
        console.error('Price Chart: Error updating price chart:', error);
        
        // استفاده از قیمت‌های پیش‌فرض در صورت خطا
        const fallbackPrices = {
            lvlPol: 0.001,
            lvlUsd: 0.001,
            polUsd: 1.00
        };
        
        updatePriceCards(fallbackPrices);
        updateChartData(fallbackPrices);
    }
}

// Update chart data
function updateChartData(prices) {
    if (!chartInstance) return;
    
    try {
        const timestamp = Date.now();
        
        // اضافه کردن داده‌های جدید به تاریخچه
        priceHistory.lvlUsd.push({ time: timestamp, value: prices.lvlUsd });
        priceHistory.lvlPol.push({ time: timestamp, value: prices.lvlPol });
        priceHistory.polUsd.push({ time: timestamp, value: prices.polUsd });
        
        // نگهداری حداکثر 1 سال داده
        const cutoff = timestamp - (365 * 24 * 60 * 60 * 1000);
        priceHistory.lvlUsd = priceHistory.lvlUsd.filter(item => item.time >= cutoff);
        priceHistory.lvlPol = priceHistory.lvlPol.filter(item => item.time >= cutoff);
        priceHistory.polUsd = priceHistory.polUsd.filter(item => item.time >= cutoff);
        
        // فیلتر کردن داده‌ها بر اساس دوره زمانی انتخاب شده
        const periodHours = timePeriods[currentTimePeriod]?.hours || 24;
        const periodCutoff = timestamp - (periodHours * 60 * 60 * 1000);
        
        const filteredLvlUsd = priceHistory.lvlUsd.filter(item => item.time >= periodCutoff);
        const filteredLvlPol = priceHistory.lvlPol.filter(item => item.time >= periodCutoff);
        const filteredPolUsd = priceHistory.polUsd.filter(item => item.time >= periodCutoff);
        
        // به‌روزرسانی داده‌های نمودار
        chartInstance.data.labels = filteredLvlUsd.map(item => new Date(item.time).toLocaleTimeString('fa-IR'));
        chartInstance.data.datasets[0].data = filteredLvlUsd.map(item => item.value);
        chartInstance.data.datasets[1].data = filteredLvlPol.map(item => item.value);
        chartInstance.data.datasets[2].data = filteredPolUsd.map(item => item.value);
        
        chartInstance.update('none');
        
    } catch (error) {
        console.error('Price Chart: Error updating chart data:', error);
    }
}

// Update price cards
function updatePriceCards(prices) {
    try {
        // Format prices
        const lvlUsdFormatted = formatPrice(prices.lvlUsd, 6);
        const lvlPolFormatted = formatPrice(prices.lvlPol, 6);
        const polUsdFormatted = formatPrice(prices.polUsd, 4);
        
        // Update chart price cards (کارت‌های نمودار)
        updateElement('lvl-usd-price', lvlUsdFormatted, '$');
        updateElement('lvl-pol-price', lvlPolFormatted, '', ' POL');
        updateElement('pol-usd-price', polUsdFormatted, '$');
        
        // Update bottom price cards (کارت‌های پایین صفحه)
        updateElement('chart-lvl-usd', lvlUsdFormatted, '$');
        updateElement('chart-lvl-pol', lvlPolFormatted, '', ' POL');
        updateElement('chart-pol-usd', polUsdFormatted, '$');
        
        // Calculate and display price changes
        updatePriceChanges();
        
        // Update last update time
        const now = new Date();
        const timeString = now.toLocaleTimeString('fa-IR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        updateElement('price-chart-last-update', timeString);
        
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
    try {
        // پاک کردن همه interval ها
        updateIntervals.forEach(interval => clearInterval(interval));
        updateIntervals = [];
        
        // پاک کردن نمودار
        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }
        
        // پاک کردن تاریخچه
        priceHistory = {
            lvlUsd: [],
            lvlPol: [],
            polUsd: []
        };
        
    } catch (error) {
        console.error('Price Chart: Error stopping price chart:', error);
    }
}

async function fetchContractStats() {
    try {
        const { contract, provider } = await window.connectWallet();
        
        // دریافت آمار قرارداد
        const [
            totalSupply, binaryPool, 
            totalPoints, totalClaimableBinaryPoints, pointValue
        ] = await Promise.all([
            contract.totalSupply().catch(() => 0n),
            contract.binaryPool().catch(() => 0n),
            contract.totalPoints().catch(() => 0n),
            contract.totalClaimableBinaryPoints().catch(() => 0n),
            contract.getPointValue().catch(() => 0n)
        ]);
        
        // محاسبه circulatingSupply
        let circulatingSupply = totalSupply;
        try {
            const contractBalance = await contract.balanceOf(contract.target);
            circulatingSupply = totalSupply - contractBalance;
        } catch (e) {
            circulatingSupply = totalSupply;
        }
        
        // دریافت موجودی POL قرارداد
        let polBalance = 0n;
        try {
            polBalance = await provider.getBalance(contract.target);
        } catch (e) {
            // خطا را نادیده بگیر
        }
        
        return {
            totalSupply: totalSupply.toString(),
            binaryPool: binaryPool.toString(),
            totalPoints: totalPoints.toString(),
            totalClaimableBinaryPoints: totalClaimableBinaryPoints.toString(),
            pointValue: pointValue.toString(),
            circulatingSupply: ethers.formatUnits(circulatingSupply, 18),
            polBalance: ethers.formatEther(polBalance)
        };
        
    } catch (error) {
        console.error('Price Chart: Error fetching contract stats:', error);
        return null;
    }
}

// Export functions for global use
window.priceChart = {
    initialize: initializePriceChart,
    stop: stopPriceChart,
    update: updatePriceChart,
    changeTimePeriod: changeTimePeriod
};

async function fetchPolUsdPriceForChart() {
    // استفاده از تابع کمکی سراسری
    return await window.fetchPolUsdPrice();
} 