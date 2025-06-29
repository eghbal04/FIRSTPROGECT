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
        console.log('Price Chart: Initializing...');
        
        // Load Chart.js if not already loaded
        await loadChartJS();
        
        // Initialize the chart
        initializeChart();
        
        // Setup time period buttons
        setupTimePeriodButtons();
        
        // Load initial prices
        await fetchContractStats();
        await updatePriceChart();
        
        // Start auto-update with current period interval
        startChartIntervals();
        
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
            
            chartInstance.data.labels = filteredLvlUsd.map(item => new Date(item.time).toLocaleTimeString('fa-IR'));
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
    
    console.log('Price Chart: Chart initialized');
}

// Update price chart data
async function updatePriceChart() {
    try {
        console.log('Price Chart: Updating prices...');
        
        // دریافت قیمت POL از Coingecko
        const polUsdPrice = await fetchPolUsdPrice();
        
        // دریافت آمار قرارداد
        const contractStats = await fetchContractStats();
        
        if (!contractStats) {
            console.warn('Price Chart: No contract stats available');
            return;
        }
        
        // محاسبه قیمت‌ها
        const polBalance = parseFloat(contractStats.polBalance || '0');
        const circulatingSupply = parseFloat(contractStats.circulatingSupply || '1');
        
        // محاسبه LVL/POL (قیمت توکن بر حسب POL)
        const lvlPolPrice = circulatingSupply > 0 ? polBalance / circulatingSupply : 0.001;
        
        // محاسبه LVL/USD (قیمت توکن بر حسب دلار)
        const lvlUsdPrice = lvlPolPrice * polUsdPrice;
        
        const prices = {
            lvlPol: lvlPolPrice,
            lvlUsd: lvlUsdPrice,
            polUsd: polUsdPrice
        };
        
        console.log('Price Chart: Calculated prices:', {
            'LVL/POL': lvlPolPrice,
            'LVL/USD': lvlUsdPrice,
            'POL/USD': polUsdPrice
        });
        
        // به‌روزرسانی کارت‌های قیمت
        updatePriceCards(prices);
        
        // به‌روزرسانی نمودار
        updateChartData(prices);
        
        console.log('Price Chart: Updated successfully');
        
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
        
        console.log('Price Chart: Using fallback prices due to error');
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
        
        console.log('Price Chart: Updated all price cards:', {
            lvlUsd: lvlUsdFormatted,
            lvlPol: lvlPolFormatted,
            polUsd: polUsdFormatted
        });
        
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
        
        console.log('Price Chart: Stopped successfully');
        
    } catch (error) {
        console.error('Price Chart: Error stopping price chart:', error);
    }
}

async function fetchPolUsdPrice() {
    try {
        // تلاش با API های مختلف
        const apis = [
            {
                name: 'Coingecko',
                url: 'https://api.coingecko.com/api/v3/simple/price?ids=polygon&vs_currencies=usd',
                proxy: true
            },
            {
                name: 'Binance',
                url: 'https://api.binance.com/api/v3/ticker/price?symbol=MATICUSDT',
                proxy: false
            },
            {
                name: 'Coinbase',
                url: 'https://api.coinbase.com/v2/prices/MATIC-USD/spot',
                proxy: false
            }
        ];
        
        for (const api of apis) {
            try {
                console.log('Price Chart: Trying API:', api.name);
                
                let response;
                if (api.proxy) {
                    // استفاده از proxy برای Coingecko
                    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(api.url)}`;
                    response = await fetch(proxyUrl, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                } else {
                    response = await fetch(api.url, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                }
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Price Chart: Response from', api.name, ':', data);
                
                let price = null;
                
                // پردازش پاسخ بر اساس نوع API
                if (api.name === 'Coingecko' && data.polygon && data.polygon.usd) {
                    price = data.polygon.usd;
                } else if (api.name === 'Binance' && data.price) {
                    price = parseFloat(data.price);
                } else if (api.name === 'Coinbase' && data.data && data.data.amount) {
                    price = parseFloat(data.data.amount);
                }
                
                if (price && price > 0) {
                    console.log('Price Chart: POL/USD price from', api.name, ':', price);
                    return price;
                }
                
            } catch (error) {
                console.warn('Price Chart: Error with', api.name, ':', error.message);
                continue; // ادامه با API بعدی
            }
        }
        
        // اگر هیچ API کار نکرد، از قرارداد استفاده کن
        console.log('Price Chart: All APIs failed, trying contract price...');
        try {
            const { contract } = await window.connectWallet();
            const contractPrice = await contract.getLatestMaticPrice();
            const price = parseFloat(ethers.formatUnits(contractPrice, 8));
            console.log('Price Chart: POL/USD price from contract:', price);
            return price;
        } catch (contractError) {
            console.warn('Price Chart: Contract price failed:', contractError.message);
        }
        
        // در نهایت از قیمت پیش‌فرض استفاده کن
        console.log('Price Chart: Using fallback POL price: 1.00 USD');
        return 1.00;
        
    } catch (error) {
        console.error('Price Chart: Error fetching POL/USD price:', error);
        return 1.00; // قیمت پیش‌فرض
    }
}

async function fetchContractStats() {
    try {
        const { contract, provider } = await window.connectWallet();
        
        // دریافت آمار قرارداد
        const [
            totalUsers, totalSupply, binaryPool, 
            rewardPool, totalPoints, totalClaimableBinaryPoints, pointValue
        ] = await Promise.all([
            contract.totalUsers().catch(() => 0n),
            contract.totalSupply().catch(() => 0n),
            contract.binaryPool().catch(() => 0n),
            contract.rewardPool().catch(() => 0n),
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
            console.warn('Price Chart: Could not calculate circulating supply, using total supply');
            circulatingSupply = totalSupply;
        }
        
        // دریافت موجودی POL قرارداد
        let polBalance = 0n;
        try {
            polBalance = await provider.getBalance(contract.target);
        } catch (e) {
            console.warn('Price Chart: Could not get contract POL balance:', e);
        }
        
        return {
            totalUsers: totalUsers.toString(),
            totalSupply: ethers.formatUnits(totalSupply, 18),
            circulatingSupply: ethers.formatUnits(circulatingSupply, 18),
            binaryPool: ethers.formatEther(binaryPool),
            rewardPool: ethers.formatEther(rewardPool),
            totalPoints: ethers.formatUnits(totalPoints, 18),
            totalClaimableBinaryPoints: ethers.formatUnits(totalClaimableBinaryPoints, 18),
            pointValue: ethers.formatUnits(pointValue, 18),
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

console.log('Price Chart module loaded successfully'); 