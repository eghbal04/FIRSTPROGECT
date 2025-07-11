// Price History Manager - Manages both token and point price history
class PriceHistoryManager {
    constructor() {
        this.tokenHistory = [];
        this.pointHistory = [];
        this.maxHistoryLength = 1000; // Maximum number of price points to store
        this.init();
    }

    init() {
        this.loadHistory();
        console.log('PriceHistoryManager initialized');
    }

    // Add new token price to history
    async addTokenPrice(price) {
        const timestamp = Date.now();
        const priceEntry = {
            timestamp: timestamp,
            price: price,
            time: new Date(timestamp)
        };

        this.tokenHistory.push(priceEntry);
        
        // Keep only the latest entries
        if (this.tokenHistory.length > this.maxHistoryLength) {
            this.tokenHistory = this.tokenHistory.slice(-this.maxHistoryLength);
        }

        this.saveHistory();
        
        // Update current price display
        const priceDisplay = document.getElementById('current-price-display');
        if (priceDisplay) {
            priceDisplay.textContent = this.formatPrice(price);
        }
    }

    // Add new point price to history
    async addPointPrice(price) {
        const timestamp = Date.now();
        const priceEntry = {
            timestamp: timestamp,
            price: price,
            time: new Date(timestamp)
        };

        this.pointHistory.push(priceEntry);
        
        // Keep only the latest entries
        if (this.pointHistory.length > this.maxHistoryLength) {
            this.pointHistory = this.pointHistory.slice(-this.maxHistoryLength);
        }

        this.saveHistory();
        
        // Update current point display
        const pointDisplay = document.getElementById('current-point-display');
        if (pointDisplay) {
            pointDisplay.textContent = this.formatPrice(price);
        }
    }

    // Get real prices up to current time for a specific period
    getRealPricesUpToNow(type, period) {
        const history = type === 'point' ? this.pointHistory : this.tokenHistory;
        const now = new Date();
        let prices = [];

        if (period === 'day') {
            // Get prices for the last 24 hours
            const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const dayPrices = history.filter(entry => entry.timestamp >= dayAgo.getTime());
            
            // Group by hour and get the latest price for each hour
            for (let i = 0; i < 24; i++) {
                const hourStart = new Date(now);
                hourStart.setHours(i, 0, 0, 0);
                const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
                
                const hourPrices = dayPrices.filter(entry => 
                    entry.timestamp >= hourStart.getTime() && entry.timestamp < hourEnd.getTime()
                );
                
                if (hourPrices.length > 0) {
                    prices.push(hourPrices[hourPrices.length - 1].price);
                } else {
                    prices.push(0);
                }
            }
        } else if (period === 'week') {
            // Get prices for the last 7 days
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const weekPrices = history.filter(entry => entry.timestamp >= weekAgo.getTime());
            
            // Group by day and get the latest price for each day
            for (let i = 0; i < 7; i++) {
                const dayStart = new Date(now);
                dayStart.setDate(dayStart.getDate() - 6 + i);
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
                
                const dayPrices = weekPrices.filter(entry => 
                    entry.timestamp >= dayStart.getTime() && entry.timestamp < dayEnd.getTime()
                );
                
                if (dayPrices.length > 0) {
                    prices.push(dayPrices[dayPrices.length - 1].price);
                } else {
                    prices.push(0);
                }
            }
        } else if (period === 'month') {
            // Get prices for the last 30 days
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const monthPrices = history.filter(entry => entry.timestamp >= monthAgo.getTime());
            
            // Group by day and get the latest price for each day
            for (let i = 0; i < 30; i++) {
                const dayStart = new Date(now);
                dayStart.setDate(dayStart.getDate() - 29 + i);
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
                
                const dayPrices = monthPrices.filter(entry => 
                    entry.timestamp >= dayStart.getTime() && entry.timestamp < dayEnd.getTime()
                );
                
                if (dayPrices.length > 0) {
                    prices.push(dayPrices[dayPrices.length - 1].price);
                } else {
                    prices.push(0);
                }
            }
        } else if (period === 'year') {
            // Get prices for the last 12 months
            const yearAgo = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000);
            const yearPrices = history.filter(entry => entry.timestamp >= yearAgo.getTime());
            
            // Group by month and get the latest price for each month
            for (let i = 0; i < 12; i++) {
                const monthStart = new Date(now);
                monthStart.setMonth(monthStart.getMonth() - 11 + i);
                monthStart.setDate(1);
                monthStart.setHours(0, 0, 0, 0);
                const monthEnd = new Date(monthStart);
                monthEnd.setMonth(monthEnd.getMonth() + 1);
                
                const monthPrices = yearPrices.filter(entry => 
                    entry.timestamp >= monthStart.getTime() && entry.timestamp < monthEnd.getTime()
                );
                
                if (monthPrices.length > 0) {
                    prices.push(monthPrices[monthPrices.length - 1].price);
                } else {
                    prices.push(0);
                }
            }
        }

        return prices;
    }

    // Get statistics for a specific period
    getHistoryStats(type, period) {
        const prices = this.getRealPricesUpToNow(type, period).filter(p => p > 0);
        
        if (prices.length === 0) {
            return { min: 0, max: 0, avg: 0 };
        }

        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;

        return { min, max, avg };
    }

    // Format price for display
    formatPrice(price) {
        if (price === 0 || price === '0') return '0';
        const numPrice = parseFloat(price);
        if (isNaN(numPrice)) return price;
        if (numPrice < 0.000001) {
            return numPrice.toExponential(6);
        }
        return numPrice.toFixed(6);
    }

    // Update token price from contract
    async updateTokenPrice() {
        try {
            if (!window.contractConfig || !window.contractConfig.contract) {
                return null;
            }
            
            const contract = window.contractConfig.contract;
            const tokenPrice = await contract.getTokenPrice();
            const tokenPriceNum = parseFloat(ethers.formatUnits(tokenPrice, 18));
            
            await this.addTokenPrice(tokenPriceNum);
            return tokenPriceNum;
            
        } catch (error) {
            console.error('Error updating token price:', error);
            return null;
        }
    }

    // Update point price from contract
    async updatePointPrice() {
        try {
            if (!window.contractConfig || !window.contractConfig.contract) {
                return null;
            }
            
            const contract = window.contractConfig.contract;
            const pointValue = await contract.getPointValue();
            const pointValueNum = parseFloat(ethers.formatUnits(pointValue, 18));
            
            await this.addPointPrice(pointValueNum);
            return pointValueNum;
            
        } catch (error) {
            console.error('Error updating point price:', error);
            return null;
        }
    }

    // Save history to localStorage
    saveHistory() {
        try {
            localStorage.setItem('tokenPriceHistory', JSON.stringify(this.tokenHistory));
            localStorage.setItem('pointPriceHistory', JSON.stringify(this.pointHistory));
        } catch (error) {
            console.error('Error saving price history:', error);
        }
    }

    // Load history from localStorage
    loadHistory() {
        try {
            const tokenHistory = localStorage.getItem('tokenPriceHistory');
            const pointHistory = localStorage.getItem('pointPriceHistory');
            
            this.tokenHistory = tokenHistory ? JSON.parse(tokenHistory) : [];
            this.pointHistory = pointHistory ? JSON.parse(pointHistory) : [];
        } catch (error) {
            console.error('Error loading price history:', error);
            this.tokenHistory = [];
            this.pointHistory = [];
        }
    }

    // Clear all history
    clearHistory() {
        this.tokenHistory = [];
        this.pointHistory = [];
        this.saveHistory();
        
        // Clear localStorage
        try {
            localStorage.removeItem('tokenPriceHistory');
            localStorage.removeItem('pointPriceHistory');
        } catch (error) {
            console.error('Error clearing price history:', error);
        }
    }
}

// Initialize PriceHistoryManager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.priceHistoryManager = new PriceHistoryManager();
}); 