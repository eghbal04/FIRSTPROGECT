// Price Chart Module
let priceChartInterval = null;
let priceHistory = {
    lvlUsd: [],
    lvlMatic: [],
    maticUsd: []
};

// Initialize price chart
async function initializePriceChart() {
    try {
        console.log('Price Chart: Initializing...');
        
        // Load initial prices
        await updatePriceChart();
        
        // Start auto-update every 30 seconds
        priceChartInterval = setInterval(updatePriceChart, 30000);
        
        console.log('Price Chart: Initialized successfully');
        
    } catch (error) {
        console.error('Price Chart: Error initializing:', error);
        showPriceChartError('خطا در راه‌اندازی چارت قیمت');
    }
}

// Update price chart data
async function updatePriceChart() {
    try {
        console.log('Price Chart: Updating prices...');
        
        // Get prices from contract
        const prices = await window.getPrices();
        
        // Add to history (keep last 24 data points - 12 hours with 30s intervals)
        const timestamp = Date.now();
        
        priceHistory.lvlUsd.push({
            time: timestamp,
            value: parseFloat(prices.lvlPriceUSD)
        });
        
        priceHistory.lvlMatic.push({
            time: timestamp,
            value: parseFloat(prices.lvlPriceMatic)
        });
        
        priceHistory.maticUsd.push({
            time: timestamp,
            value: parseFloat(prices.maticPrice)
        });
        
        // Keep only last 24 data points
        if (priceHistory.lvlUsd.length > 24) {
            priceHistory.lvlUsd.shift();
            priceHistory.lvlMatic.shift();
            priceHistory.maticUsd.shift();
        }
        
        // Update UI
        updatePriceChartUI(prices);
        
        // Calculate and display price changes
        updatePriceChanges();
        
        console.log('Price Chart: Updated successfully');
        
    } catch (error) {
        console.error('Price Chart: Error updating prices:', error);
        showPriceChartError('خطا در به‌روزرسانی قیمت‌ها');
    }
}

// Update price chart UI
function updatePriceChartUI(prices) {
    try {
        // Format prices
        const lvlUsdFormatted = formatPrice(prices.lvlPriceUSD, 6);
        const lvlMaticFormatted = formatPrice(prices.lvlPriceMatic, 6);
        const maticUsdFormatted = formatPrice(prices.maticPrice, 4);
        
        // Update price values
        updateElement('chart-lvl-usd', lvlUsdFormatted, '$');
        updateElement('chart-lvl-matic', lvlMaticFormatted, '', ' MATIC');
        updateElement('chart-matic-usd', maticUsdFormatted, '$');
        
        // Update last update time
        const now = new Date();
        const timeString = now.toLocaleTimeString('fa-IR');
        updateElement('chart-last-update', timeString);
        
    } catch (error) {
        console.error('Price Chart: Error updating UI:', error);
    }
}

// Calculate and display price changes
function updatePriceChanges() {
    try {
        // Calculate changes for LVL/USD
        const lvlUsdChange = calculatePriceChange(priceHistory.lvlUsd);
        updatePriceChangeElement('chart-lvl-usd-change', lvlUsdChange);
        
        // Calculate changes for LVL/MATIC
        const lvlMaticChange = calculatePriceChange(priceHistory.lvlMatic);
        updatePriceChangeElement('chart-lvl-matic-change', lvlMaticChange);
        
        // Calculate changes for MATIC/USD
        const maticUsdChange = calculatePriceChange(priceHistory.maticUsd);
        updatePriceChangeElement('chart-matic-usd-change', maticUsdChange);
        
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
    update: updatePriceChart
};

console.log('Price Chart module loaded successfully'); 