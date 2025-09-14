/**
 * Central Dashboard Updater - Central Dashboard Update System
 * A central interval that checks each value individually and only updates changed values
 */

class CentralDashboardUpdater {
    constructor() {
        this.interval = null;
        this.isRunning = false;
        this.updateFrequency = 5000; // 5 seconds
        this.previousValues = new Map();
        this.debugMode = false;
        
        // List of values that should be checked
        this.trackedElements = [
            'circulating-supply',
            'total-points', 
            'contract-token-balance',
            'dashboard-cashback-value',
            'dashboard-dai-balance',
            'dashboard-wallets-count',
            'dashboard-registration-price',
            'dashboard-point-value',
            'dashboard-token-price',
            'chart-lvl-usd',
            'point-value'
        ];
    }

    /**
     * Start central system - only active interval
     */
    start() {
        if (this.isRunning) {
            this.log('⚠️ Central system is already active');
            return;
        }

        this.log('🚀 Starting central dashboard update system...');
        
        // Stop all old intervals
        this.stopAllOtherIntervals();
        
        this.isRunning = false; // Deactivated - manual refresh only
        // this.interval = setInterval(() => {
        //     this.checkAndUpdateValues();
        // }, this.updateFrequency);
        
        this.log(`❌ Central system deactivated - manual refresh only`);
    }

    /**
     * Stop central system
     */
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isRunning = false;
        this.log('⏹️ Central system stopped');
    }

    /**
     * Stop all old intervals
     */
    stopAllOtherIntervals() {
        this.log('🧹 Removing all old intervals...');
        
        // Stop dashboard intervals
        if (window.dashboardUpdateInterval) {
            clearInterval(window.dashboardUpdateInterval);
            window.dashboardUpdateInterval = null;
            this.log('❌ dashboardUpdateInterval removed');
        }
        
        // Stop price charts intervals
        if (window.priceChartsManager && window.priceChartsManager.updateInterval) {
            clearInterval(window.priceChartsManager.updateInterval);
            window.priceChartsManager.updateInterval = null;
            this.log('❌ priceChartsManager interval removed');
        }
        
        // Stop network stats interval
        if (window.networkStatsInterval) {
            clearInterval(window.networkStatsInterval);
            window.networkStatsInterval = null;
            this.log('❌ networkStatsInterval removed');
        }
        
        // Stop news auto refresh
        if (window.autoRefreshInterval) {
            clearInterval(window.autoRefreshInterval);
            window.autoRefreshInterval = null;
            this.log('❌ autoRefreshInterval removed');
        }

        // Prevent creation of new intervals
        window._blockchainInfoIntervalSet = true;
        
        this.log('✅ All old intervals removed');
    }

    /**
     * Check and update values - only changed values
     */
    async checkAndUpdateValues() {
        try {
            // Check page status
            if (document.hidden) {
                return; // If page is hidden, do nothing
            }

            // Check wallet connection
            if (!window.contractConfig || !window.contractConfig.contract) {
                return; // If wallet is not connected, do nothing
            }

            const contract = window.contractConfig.contract;
            let updateCount = 0;

            // Helper function for consistent number formatting (like main.js)
            const formatNumber = (value, suffix = '', isInteger = false, maxDecimals = 2) => {
                if (value === null || value === undefined || value === '') return 'Not Available';
                const num = parseFloat(value);
                if (isNaN(num)) return 'Not Available';
                if (num === 0) return '0' + suffix;
                if (!isInteger && num < 0.000001) {
                    return num.toExponential(6) + suffix;
                }
                if (isInteger) {
                    // For integers use toLocaleString
                    return Math.floor(num).toLocaleString('en-US') + suffix;
                }
                // For decimal numbers use toLocaleString (like main.js)
                return num.toLocaleString('en-US', {maximumFractionDigits: maxDecimals}) + suffix;
            };

            // 1. Check Total Supply
            try {
                const totalSupply = await contract.totalSupply();
                const supplyNum = parseFloat(ethers.formatUnits(totalSupply, 18));
                const formattedSupply = formatNumber(supplyNum, '', false, 2); // Use consistent formatNumber
                if (this.updateIfChanged('circulating-supply', formattedSupply)) {
                    updateCount++;
                }

                // Calculate DAI equivalent for total supply
                try {
                    const tokenPrice = await this.getTokenPrice();
                    if (tokenPrice && tokenPrice > 0) {
                        const daiEquivalent = supplyNum * tokenPrice;
                        const daiFormatted = formatNumber(daiEquivalent, '', false, 2);
                        if (this.updateIfChanged('circulating-supply-dai', daiFormatted)) {
                            updateCount++;
                        }
                    } else {
                        if (this.updateIfChanged('circulating-supply-dai', '-')) {
                            updateCount++;
                        }
                    }
                } catch (error) {
                    this.log('❌ Error calculating DAI equivalent for total supply:', error.message);
                    if (this.updateIfChanged('circulating-supply-dai', '-')) {
                        updateCount++;
                    }
                }
            } catch (error) {
                this.log('❌ Error getting Total Supply:', error.message);
            }

            // 2. Check Total Points
            try {
                const totalPoints = await contract.totalClaimableBinaryPoints();
                const pointsNum = parseFloat(ethers.formatUnits(totalPoints, 18));
                const formattedPoints = formatNumber(pointsNum, '', true);
                if (this.updateIfChanged('total-points', formattedPoints)) {
                    updateCount++;
                }
            } catch (error) {
                this.log('❌ Error getting Total Points:', error.message);
            }

            // 3. Check Contract Token Balance
            try {
                const contractBalance = await contract.balanceOf(contract.target);
                const balanceNum = parseFloat(ethers.formatUnits(contractBalance, 18));
                const formattedBalance = formatNumber(balanceNum, '', false, 4); // Remove unit suffix
                if (this.updateIfChanged('contract-token-balance', formattedBalance)) {
                    updateCount++;
                }

                // Calculate DAI equivalent for contract balance
                try {
                    const tokenPrice = await this.getTokenPrice();
                    if (tokenPrice && tokenPrice > 0) {
                        const daiEquivalent = balanceNum * tokenPrice;
                        const daiFormatted = formatNumber(daiEquivalent, '', false, 2);
                        if (this.updateIfChanged('contract-token-balance-dai', daiFormatted)) {
                            updateCount++;
                        }
                    } else {
                        if (this.updateIfChanged('contract-token-balance-dai', '-')) {
                            updateCount++;
                        }
                    }
                } catch (error) {
                    this.log('❌ Error calculating DAI equivalent for contract balance:', error.message);
                    if (this.updateIfChanged('contract-token-balance-dai', '-')) {
                        updateCount++;
                    }
                }
            } catch (error) {
                this.log('❌ Error getting Contract Balance:', error.message);
            }

            // 4. Check Token Price
            try {
                const tokenPrice = await contract.getTokenPrice();
                let priceFormatted;
                
                if (window.formatTokenPrice) {
                    priceFormatted = window.formatTokenPrice(tokenPrice);
                } else {
                    const priceNum = parseFloat(ethers.formatUnits(tokenPrice, 18));
                    priceFormatted = formatNumber(priceNum, '', false, 18); // Use 18 decimals for price precision
                }
                
                if (this.updateIfChanged('chart-lvl-usd', priceFormatted)) {
                    updateCount++;
                }
                if (this.updateIfChanged('dashboard-token-price', priceFormatted)) {
                    updateCount++;
                }
            } catch (error) {
                this.log('❌ Error getting Token Price:', error.message);
            }

            // 5. Check Point Value
            try {
                const pointValue = await contract.getPointValue();
                const pointValueNum = parseFloat(ethers.formatUnits(pointValue, 18));
                const pointValueFormatted = formatNumber(pointValueNum, '', false, 6); // Remove unit suffix - Use 6 decimals for point values
                
                if (this.updateIfChanged('point-value', pointValueFormatted)) {
                    updateCount++;
                }
                if (this.updateIfChanged('dashboard-point-value', pointValueFormatted)) {
                    updateCount++;
                }

                // Calculate DAI equivalent for point value
                try {
                    const tokenPrice = await this.getTokenPrice();
                    if (tokenPrice && tokenPrice > 0) {
                        const daiEquivalent = pointValueNum * tokenPrice;
                        const daiFormatted = formatNumber(daiEquivalent, '', false, 2);
                        if (this.updateIfChanged('dashboard-point-value-dai', daiFormatted)) {
                            updateCount++;
                        }
                    } else {
                        if (this.updateIfChanged('dashboard-point-value-dai', '-')) {
                            updateCount++;
                        }
                    }
                } catch (error) {
                    this.log('❌ Error calculating DAI equivalent for point value:', error.message);
                    if (this.updateIfChanged('dashboard-point-value-dai', '-')) {
                        updateCount++;
                    }
                }
            } catch (error) {
                this.log('❌ Error getting Point Value:', error.message);
            }

            // 6. Check Cashback Pool
            try {
                let cashback;
                
                // Try different possible function names
                if (typeof contract.cashBack === 'function') {
                    cashback = await contract.cashBack();
                } else if (typeof contract.cashback === 'function') {
                    cashback = await contract.cashback();
                } else {
                    // If no cashback function exists, use 0
                    cashback = 0n;
                }
                
                const cashbackNum = parseFloat(ethers.formatUnits(cashback, 18));
                const cashbackFormatted = formatNumber(cashbackNum, '', false, 2);
                if (this.updateIfChanged('dashboard-cashback-value', cashbackFormatted)) {
                    updateCount++;
                }

                // Calculate DAI equivalent for cashback pool
                try {
                    const tokenPrice = await this.getTokenPrice();
                    if (tokenPrice && tokenPrice > 0) {
                        const daiEquivalent = cashbackNum * tokenPrice;
                        const daiFormatted = formatNumber(daiEquivalent, '', false, 2);
                        if (this.updateIfChanged('dashboard-cashback-value-dai', daiFormatted)) {
                            updateCount++;
                        }
                    } else {
                        if (this.updateIfChanged('dashboard-cashback-value-dai', '-')) {
                            updateCount++;
                        }
                    }
                } catch (error) {
                    this.log('❌ Error calculating DAI equivalent for cashback pool:', error.message);
                    if (this.updateIfChanged('dashboard-cashback-value-dai', '-')) {
                        updateCount++;
                    }
                }
            } catch (error) {
                this.log('❌ Error getting Cashback Pool:', error.message);
            }

            // 7. Check Wallets Count
            try {
                // Current contract has function without parameters
                const walletsCount = await contract.wallets();
                if (this.updateIfChanged('dashboard-wallets-count', walletsCount.toString())) {
                    updateCount++;
                }
            } catch (error) {
                this.log('❌ Error getting Wallets Count:', error.message);
            }

            // 8. Check DAI Contract Balance
            try {
                let daiBalance;
                
                // Try with first contract function
                if (typeof contract.getContractdaiBalance === 'function') {
                    daiBalance = await contract.getContractdaiBalance();
                    this.log('✅ DAI balance received from getContractdaiBalance');
                } else if (typeof contract.getContractDAIBalance === 'function') {
                    daiBalance = await contract.getContractDAIBalance();
                    this.log('✅ DAI balance received from getContractDAIBalance');
                } else {
                    // Fallback to direct DAI contract
                    if (window.DAI_ADDRESS && window.DAI_ABI) {
                        const daiContract = new ethers.Contract(window.DAI_ADDRESS, window.DAI_ABI, contract.provider);
                        daiBalance = await daiContract.balanceOf(contract.target || window.IAM_ADDRESS);
                        this.log('✅ DAI balance received from DAI contract');
                    } else {
                        this.log('❌ DAI_ADDRESS or DAI_ABI not available');
                        daiBalance = 0n;
                    }
                }
                
                const daiNum = parseFloat(ethers.formatUnits(daiBalance, 18));
                const daiFormatted = formatNumber(daiNum, '', false, 2); // Use consistent formatNumber
                if (this.updateIfChanged('dashboard-dai-balance', daiFormatted)) {
                    updateCount++;
                }
            } catch (error) {
                this.log('❌ Error getting DAI Balance:', error.message);
            }

            // 9. Check Registration Price
            try {
                let regPrice;
                if (typeof contract.getRegPrice === 'function') {
                    regPrice = await contract.getRegPrice();
                } else if (typeof window.getRegPrice === 'function') {
                    regPrice = await window.getRegPrice(contract);
                } else if (typeof contract.registrationPrice === 'function') {
                    regPrice = await contract.registrationPrice();
                } else if (typeof contract.regPrice === 'function') {
                    regPrice = await contract.regPrice();
                } else {
                    regPrice = 0n;
                }

                const regPriceNum = parseFloat(ethers.formatUnits(regPrice, 18));
                const regPriceFormatted = formatNumber(regPriceNum, '', false, 0); // Remove unit suffix
                if (this.updateIfChanged('dashboard-registration-price', regPriceFormatted)) {
                    updateCount++;
                }

                // Calculate DAI equivalent
                try {
                    const tokenPrice = await this.getTokenPrice();
                    if (tokenPrice && tokenPrice > 0) {
                        const daiEquivalent = regPriceNum * tokenPrice;
                        const daiFormatted = formatNumber(daiEquivalent, '', false, 2);
                        if (this.updateIfChanged('dashboard-registration-price-dai', daiFormatted)) {
                            updateCount++;
                        }
                    } else {
                        if (this.updateIfChanged('dashboard-registration-price-dai', '-')) {
                            updateCount++;
                        }
                    }
                } catch (error) {
                    this.log('❌ Error calculating DAI equivalent:', error.message);
                    if (this.updateIfChanged('dashboard-registration-price-dai', '-')) {
                        updateCount++;
                    }
                }
            } catch (error) {
                this.log('❌ Error getting Registration Price:', error.message);
            }

            // Report results
            if (updateCount > 0) {
                this.log(`🔄 ${updateCount} values updated`);
            } else {
                this.log('⚡ No changes detected');
            }

        } catch (error) {
            this.log('❌ Error checking values:', error.message);
        }
    }

    /**
     * Get token price
     */
    async getTokenPrice() {
        try {
            if (!window.contractConfig || !window.contractConfig.contract) {
                return null;
            }
            
            const contract = window.contractConfig.contract;
            const tokenPrice = await contract.getTokenPrice();
            const priceNum = parseFloat(ethers.formatUnits(tokenPrice, 18));
            return priceNum;
        } catch (error) {
            this.log('❌ Error getting Token Price:', error.message);
            return null;
        }
    }

    /**
     * Update value only if changed
     */
    updateIfChanged(elementId, newValue) {
        const previousValue = this.previousValues.get(elementId);
        const currentValue = String(newValue);
        
        if (previousValue === currentValue) {
            return false; // No change
        }

        // Save new value
        this.previousValues.set(elementId, currentValue);
        
        // Update UI
        if (window.smartUpdate) {
            window.smartUpdate(elementId, newValue);
        } else if (window.updateValueSmoothly) {
            window.updateValueSmoothly(elementId, newValue);
        } else {
            // fallback
            const el = document.getElementById(elementId);
            if (el) {
                el.textContent = newValue;
            }
        }

        this.log(`🔄 ${elementId}: ${previousValue} → ${currentValue}`);
        return true; // Update performed
    }

    /**
     * Enable/disable debug mode
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        this.log(`${enabled ? '🐛' : '📊'} Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Log messages
     */
    log(message, ...args) {
        if (this.debugMode) {
            console.log(`[Central Updater] ${message}`, ...args);
        }
    }

    /**
     * Get system stats
     */
    getStats() {
        return {
            isRunning: this.isRunning,
            trackedElements: this.trackedElements.length,
            cachedValues: this.previousValues.size,
            updateFrequency: this.updateFrequency / 1000 + ' seconds',
            debugMode: this.debugMode
        };
    }

    /**
     * Reset memory
     */
    reset() {
        this.previousValues.clear();
        this.log('🔄 Value memory cleared');
    }
}

// Create global instance
window.centralDashboardUpdater = new CentralDashboardUpdater();

// Auto-start disabled - only manual updates
// document.addEventListener('DOMContentLoaded', function() {
//     // Delay to ensure complete loading
//     setTimeout(() => {
//         if (window.centralDashboardUpdater) {
//             window.centralDashboardUpdater.start();
//         }
//     }, 3000);
// });

// Global functions for control
window.startCentralUpdater = function() {
    return window.centralDashboardUpdater.start();
};

window.stopCentralUpdater = function() {
    return window.centralDashboardUpdater.stop();
};

window.getCentralUpdaterStats = function() {
    return window.centralDashboardUpdater.getStats();
};

window.enableCentralDebug = function() {
    return window.centralDashboardUpdater.setDebugMode(true);
};

window.disableCentralDebug = function() {
    return window.centralDashboardUpdater.setDebugMode(false);
};

window.resetCentralCache = function() {
    return window.centralDashboardUpdater.reset();
};

console.log('🎯 Central Dashboard Updater loaded successfully');