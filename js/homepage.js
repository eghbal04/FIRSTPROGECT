// homepage.js
// Other codes related to dashboard and statistics and ... (expand/collapse and marquee codes were removed)
// ...

// homepage.js - Loading dashboard data and platform statistics
let dashboardLoading = false;
let dashboardInitialized = false;
let lastDashboardUpdate = 0;
let dashboardUpdateInterval = null;
const DASHBOARD_UPDATE_INTERVAL = 30000; // 30 seconds between dashboard updates

// Global variables
let isDashboardLoading = false;
let dashboardLoadPromise = null; // Track the current loading promise
let lastDashboardCall = 0; // Track last call time for debouncing

// Function to update connection status
function updateConnectionStatus(type, message) {
    const statusElement = document.getElementById('connection-status');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `connection-status ${type}`;
        statusElement.style.display = 'block';
        
        // Clear message after 5 seconds
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 5000);
    }
}

// --- Dashboard cache: save and retrieve ---
function cacheDashboardData(data) {
  try {
    localStorage.setItem('dashboardCache', JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) { /* ignore */ }
}
function getCachedDashboardData() {
  const cached = localStorage.getItem('dashboardCache');
  if (cached) {
    try {
      return JSON.parse(cached).data;
    } catch { return null; }
  }
  return null;
}
// --- Smooth effect for value update - Smart update ---
function animateValueChange(el, newValue) {
  if (!el) return;
  
  // Use smart update system (only if changed)
  if (window.smartUpdate) {
    return window.smartUpdate(el, newValue, {
      transitionDuration: 500,
      numberAnimation: true,
      preventFlicker: true
    });
  } else if (window.updateValueSmoothly) {

    window.updateValueSmoothly(el, newValue, {
      transitionDuration: 500,
      numberAnimation: true,
      preventFlicker: true
    });
  } else {

    if (el.textContent !== newValue) {
      el.textContent = newValue;
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Set loading state for all elements
    if (window.dashboardLoadingManager) {
        window.dashboardLoadingManager.setDashboardLoading(true);
    }
    
    // Display cached data immediately
    const cached = getCachedDashboardData();
    if (cached) {
      await updateDashboardUI(
        cached.prices, cached.stats, cached.additionalStats, cached.tradingVolume, cached.priceChanges
      );
    }
    
    // Then start background update
    try {
        // Update wallet button display
        if (window.WalletConnectHandler) {
            window.WalletConnectHandler.updateWalletButtonVisibility();
        }
        
        // Start connection monitoring
        startConnectionMonitoring();
        
        // Wait for wallet connection with timeout
        const walletConnected = await waitForWalletConnection();
        
        if (walletConnected.connected) {
            // Load dashboard data only if not already loading
            if (!isDashboardLoading) {
                await loadDashboardData();
            }
            dashboardInitialized = true;

            // Central system starts automatically
            console.log('✅ Wallet connected - Central system manages updates');
        } else {
            // If wallet not connected, still try to load basic data
            console.log('⚠️ Wallet not connected - loading basic dashboard data');
            if (!isDashboardLoading) {
                await loadDashboardData();
            }
        }

    } catch (error) {
        console.error("Error in homepage:", error);
        // Remove loading state on error
        if (window.dashboardLoadingManager) {
            window.dashboardLoadingManager.setDashboardLoading(false);
        }
    }
});

// Function to start automatic dashboard update - Disabled (Central system replaced it)
function startDashboardAutoUpdate() {
    console.log('⚠️ startDashboardAutoUpdate disabled - Central system is active');
    // This function is disabled and the central system has replaced it
}

// Function to stop automatic dashboard update
function stopDashboardAutoUpdate() {
    if (dashboardUpdateInterval) {
        clearInterval(dashboardUpdateInterval);
        dashboardUpdateInterval = null;
    }
}

// Function to wait for wallet connection
async function waitForWalletConnection() {
    let attempts = 0;
    const maxAttempts = 2; // Reduced to 2 attempts (2 seconds) for faster loading
    
    while (attempts < maxAttempts) {
        try {
            // Check if checkConnection function exists
            if (typeof window.checkConnection === 'function') {
                const result = await window.checkConnection();
                if (result && result.connected) {
                    return result;
                }
            } else {
                // If checkConnection function doesn't exist, wait briefly
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        } catch (error) {
            console.warn('Wallet connection attempt failed:', error);
            // Ignore error and continue
        }
        
        await new Promise(resolve => setTimeout(resolve, 500)); // Reduced from 1000ms to 500ms
        attempts++;
    }
    
    // Instead of throwing error, return false quickly
    console.warn('Dashboard: Timeout waiting for wallet connection - continuing without wallet');
    return { connected: false, error: 'Timeout waiting for wallet connection' };
}

// Function to load dashboard data
async function loadDashboardData() {
    const now = Date.now();
    
    // Debounce: prevent calls within 2 seconds of each other
    if (now - lastDashboardCall < 2000) {
        console.log('⚠️ Dashboard call debounced (too soon after last call)');
        return;
    }
    lastDashboardCall = now;
    
    // If there's already a loading promise, wait for it instead of starting a new one
    if (dashboardLoadPromise) {
        console.log('⚠️ Dashboard already loading, waiting for existing promise...');
        return await dashboardLoadPromise;
    }
    
    if (isDashboardLoading) {
        console.log('⚠️ Dashboard already loading, skipping...');
        return;
    }
    
    // Add a small delay to prevent rapid successive calls
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (isDashboardLoading || dashboardLoadPromise) {
        console.log('⚠️ Dashboard loading started during delay, skipping...');
        return;
    }
    
    isDashboardLoading = true;
    
    // Create and store the promise
    dashboardLoadPromise = performDashboardLoad();
    
    try {
        const result = await dashboardLoadPromise;
        return result;
    } finally {
        // Clear the promise when done
        dashboardLoadPromise = null;
        isDashboardLoading = false;
    }
}

// Separate function for the actual loading logic
async function performDashboardLoad() {
    
    try {
        // Check wallet connection with timeout
        const walletConnected = await waitForWalletConnection();
        
        if (walletConnected.connected) {
            // Get data in parallel - without fallback values
            const [prices, stats, additionalStats, tradingVolume] = await Promise.all([
                window.getPrices().catch(err => {
                    console.warn('Error getting prices:', err);
                    return { IAMPriceUSD: null, IAMPriceMatic: null };
                }),
                window.getContractStats().catch(err => {
                    console.warn('Error getting contract stats:', err);
                    return {};
                }),
                getAdditionalStats().catch(err => {
                    console.warn('Error getting additional stats:', err);
                    return { wallets: null, helpFund: null };
                }),
                getTradingVolume().catch(err => {
                    console.warn('Error getting trading volume:', err);
                    return '0';
                })
            ]);
            
            // Calculate price changes
            const priceChanges = await calculatePriceChanges();
            
            // Load network statistics (non-blocking)
            try {
                await window.autoLoadNetworkStats();
            } catch (error) {
                console.warn('Failed to load network stats:', error);
            }
            
            // Check changes before updating UI (Smart update)
            const newDashboardData = {prices, stats, additionalStats, tradingVolume, priceChanges};
            
            // Check for changes in overall data
            if (window.hasObjectChanged && window.hasObjectChanged('dashboardData', newDashboardData)) {
                console.log('🔄 Changes detected in dashboard data - Updating UI');
                
                // Update UI only if changed
                await updateDashboardUI(prices, stats, additionalStats, tradingVolume, priceChanges);
                await updateDAIContractBalance();
                
                // Save new data to cache
                cacheDashboardData(newDashboardData);
                
                // Remove loading state after update completion
                if (window.dashboardLoadingManager) {
                    window.dashboardLoadingManager.setDashboardLoading(false);
                }
            } else {
                console.log('⚡ No changes in dashboard data - UI update cancelled');
                // Remove loading even if no changes
                if (window.dashboardLoadingManager) {
                    window.dashboardLoadingManager.setDashboardLoading(false);
                }
            }
        } else {
            // If wallet is not connected, show appropriate message
            updateConnectionStatus('info', 'Connect your wallet to view complete data');
            
            // Display empty state without default values
            const emptyData = {
                prices: { IAMPriceUSD: null, IAMPriceMatic: null },
                stats: {
                    totalSupply: null,
                    circulatingSupply: null,
                    binaryPool: null,
                    totalPoints: null,
                    totalClaimableBinaryPoints: null,
                    pointValue: null,
                    rewardPool: null,
                    contractTokenBalance: null
                },
                additionalStats: { wallets: null, helpFund: null },
                tradingVolume: null,
                priceChanges: { IAMPriceChange: null, maticPriceChange: null, volumeChange: null }
            };
            
            await updateDashboardUI(emptyData.prices, emptyData.stats, emptyData.additionalStats, emptyData.tradingVolume, emptyData.priceChanges);
            
            // Remove loading state
            if (window.dashboardLoadingManager) {
                window.dashboardLoadingManager.setDashboardLoading(false);
            }
        }
        
    } catch (error) {
        console.warn('Dashboard: Error loading data:', error);
        updateConnectionStatus('error', 'Error loading dashboard data');
        
        // Remove loading state on error
        if (window.dashboardLoadingManager) {
            window.dashboardLoadingManager.setDashboardLoading(false);
        }
    }
}

// Function to calculate price changes
async function calculatePriceChanges() {
    try {
        // Here you can calculate price changes
        // For example, compare with previous price or average prices
        
        // If no data is available for calculating changes, return null
        return {
            IAMPriceChange: null,
            maticPriceChange: null,
            volumeChange: null
        };
    } catch (error) {
        console.error('Dashboard: Error calculating price changes:', error);
        return {
            IAMPriceChange: null,
            maticPriceChange: null,
            volumeChange: null
        };
    }
}

// تابع به‌روزرسانی UI داشبورد
async function updateDashboardUI(prices, stats, additionalStats, tradingVolume, priceChanges) {
    const safeFormat = (val, prefix = '', suffix = '', isInteger = false, maxDecimals = 4) => {
        if (val === null || val === undefined || val === '') return 'Not Available';
        if (typeof val === 'string' && val.includes('e')) return val; // Already in scientific notation
        const num = parseFloat(val);
        if (isNaN(num)) return 'Not Available';
        if (num === 0) return '0';
        if (num < 0.000001) {
            return num.toExponential(6);
        }
        if (isInteger) return Math.floor(num).toString();
        return num.toFixed(maxDecimals);
    };

    const updateElement = (id, value, prefix = '', suffix = '', isInteger = false, maxDecimals = 4) => {
        const el = document.getElementById(id);
        if (el) {
            const formatted = safeFormat(value, prefix, suffix, isInteger, maxDecimals);
            animateValueChange(el, formatted);
        }
    };

    const updateElementExponential = (id, value, suffix = '') => {
        const el = document.getElementById(id);
        if (el) {
            let formatted;
            if (value === null || value === undefined) {
                formatted = 'Not Available';
            } else {
                const num = parseFloat(value);
                if (isNaN(num)) {
                    formatted = 'Not Available';
                } else if (num === 0) {
                    formatted = '0' + suffix;
                } else if (num < 0.000001) {
                    formatted = num.toExponential(6) + suffix;
                } else {
                    formatted = num.toFixed(6) + suffix;
                }
            }
            animateValueChange(el, formatted);
        }
    };
    
    // به‌روزرسانی قیمت‌ها با 18 رقم اعشار
    if (prices.IAMPriceUSD && prices.IAMPriceUSD !== null) {
        const element = document.getElementById('token-price');
        if (element) {
            element.textContent = prices.IAMPriceUSD;
        }
    } else {
        updateElement('token-price', null, '', '', false, 6);
    }
    // نمایش قیمت توکن به POL با نماد علمی
    updateElementExponential('token-price-matic', prices.IAMPriceMatic, ' POL');
    
    // مقداردهی توکن‌های در گردش و کل پوینت‌ها مستقیماً از توابع قرارداد
    try {
        if (window.contractConfig && window.contractConfig.contract) {
            const { contract } = await window.connectWallet();
            // totalSupply
            let supply = await contract.totalSupply();
            const supplyNum = parseFloat(ethers.formatUnits(supply, 18));
            const formattedSupply = supplyNum.toLocaleString('en-US', {maximumFractionDigits: 2});
            updateElement('circulating-supply', formattedSupply, '', '', false); // استفاده از فرمت شده بجای parseInt
            // totalClaimablePoints
            let points = await contract.totalClaimablePoints();
            // updateElement('total-points', parseInt(ethers.formatUnits(points, 0)), '', ' POINT', true);
            // pointValue از قرارداد
            let pointValue = await contract.getPointValue();
            updateElement('point-value', parseFloat(ethers.formatUnits(pointValue, 18)), '', '', false, 2); // حذف پسوند IAM
        } else {
            // اگر قرارداد در دسترس نیست، از stats استفاده کن
            if (stats.totalClaimableBinaryPoints) {
                const totalPoints = typeof stats.totalClaimableBinaryPoints === 'string' 
                    ? parseInt(stats.totalClaimableBinaryPoints.replace(/\..*$/, ''))
                    : parseInt(stats.totalClaimableBinaryPoints);
                // updateElement('total-points', totalPoints, '', ' POINT', true);
            } else {
                // updateElement('total-points', 0, '', ' POINT', true);
            }
            
            if (stats.pointValue) {
                updateElement('point-value', stats.pointValue, '', ' IAM', false, 2);
            } else {
                updateElement('point-value', 0, '', ' IAM', false, 2);
            }
        }
    } catch (e) {
        console.warn('Error fetching contract data:', e);
        // اگر خطا بود، از stats استفاده کن
        if (stats.totalClaimableBinaryPoints) {
            const totalPoints = typeof stats.totalClaimableBinaryPoints === 'string' 
                ? parseInt(stats.totalClaimableBinaryPoints.replace(/\..*$/, ''))
                : parseInt(stats.totalClaimableBinaryPoints);
            // updateElement('total-points', totalPoints, '', ' POINT', true);
        } else {
            // updateElement('total-points', 0, '', ' POINT', true);
        }
        
        if (stats.pointValue) {
            updateElement('point-value', stats.pointValue, '', ' IAM', false, 2);
        } else {
            updateElement('point-value', 0, '', ' IAM', false, 2);
        }
    }
    
    // پوینت‌های ادعا شده = 0 (چون هنوز ادعا نشدن)
    updateElement('claimed-points', 0, '', '', true);
    
    // پوینت‌های باقیمانده = کل پوینت‌ها
    if (stats.totalClaimableBinaryPoints) {
        const totalPoints = typeof stats.totalClaimableBinaryPoints === 'string' 
            ? parseInt(stats.totalClaimableBinaryPoints.replace(/\..*$/, ''))
            : parseInt(stats.totalClaimableBinaryPoints);
        // updateElement('remaining-points', totalPoints, '', '', true);
    } else {
        // updateElement('remaining-points', 0, '', '', true);
    }
    
    // موجودی قرارداد با نهایتاً ۶ رقم اعشار
    const tradingVolumeNum = Number(tradingVolume);
    updateElement('trading-volume', isNaN(tradingVolumeNum) ? null : tradingVolumeNum, '', ' POL', false, 6);
    
    // contract token balance
    let contractTokenBalanceIAM = parseFloat(stats.contractTokenBalance);
    updateElement('contract-token-balance', contractTokenBalanceIAM, '', '', false, 4); // حذف پسوند IAM
    let rewardPoolPOL = parseFloat(stats.rewardPool);
    updateElement('reward-pool', rewardPoolPOL, '', ' POL', false, 4);
}

// تابع بررسی وضعیت اتصال کیف پول
function checkWalletConnectionStatus() {
    try {
        if (window.contractConfig && window.contractConfig.address) {
            updateConnectionStatus('success', `Connected to: ${shortenAddress(window.contractConfig.address)}`);
            return true;
        } else {
            updateConnectionStatus('info', 'Wallet not connected');
            return false;
        }
    } catch (error) {
        // console.error('Dashboard: Error checking wallet status:', error);
        updateConnectionStatus('error', 'Error checking wallet status');
        return false;
    }
}

// تابع به‌روزرسانی دکمه‌های کیف پول
function updateWalletButtonVisibility() {
    const qrConnectBtn = document.getElementById('qr-connect-btn');
    const smartConnectBtn = document.getElementById('smart-connect-btn');
    const disconnectBtn = document.getElementById('disconnect-btn');
    
    if (qrConnectBtn && smartConnectBtn && disconnectBtn) {
        if (window.contractConfig && window.contractConfig.address) {
            // کیف پول متصل است
            qrConnectBtn.style.display = 'none';
            smartConnectBtn.style.display = 'none';
            disconnectBtn.style.display = 'inline-block';
        } else {
            // کیف پول متصل نیست
            qrConnectBtn.style.display = 'inline-block';
            smartConnectBtn.style.display = 'inline-block';
            disconnectBtn.style.display = 'none';
        }
    }
}

// تابع قطع اتصال کیف پول
async function disconnectWallet() {
    try {
        // پاک کردن تنظیمات قرارداد
        if (window.contractConfig) {
            window.contractConfig.provider = null;
            window.contractConfig.signer = null;
            window.contractConfig.contract = null;
            window.contractConfig.address = null;
        }
        
        // توقف به‌روزرسانی خودکار
        stopDashboardAutoUpdate();
        
        // بازنشانی داشبورد
        await resetDashboard();
        
        // به‌روزرسانی UI
        updateWalletButtonVisibility();
        updateConnectionStatus('info', 'Wallet disconnected');
        
        // Update user status bar after wallet disconnection
        if (typeof window.updateUserStatusBar === 'function') {
            setTimeout(() => {
                window.updateUserStatusBar();
            }, 1000);
        }
        
    } catch (error) {
        // console.error('Dashboard: Error disconnecting wallet:', error);
        updateConnectionStatus('error', 'Error disconnecting wallet');
    }
}

// تابع بازنشانی داشبورد
async function resetDashboard() {
    try {
        // پاک کردن همه مقادیر
        const elements = [
            'token-price', 'token-price-matic', 'circulating-supply',
            'total-points', 'claimed-points', 'remaining-points',
            'trading-volume', 'point-value', 'contract-token-balance', 'reward-pool'
        ];
        
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = '-';
            }
        });
        
        // console.log('Dashboard: Reset successfully');
        
    } catch (error) {
        // console.error('Dashboard: Error resetting dashboard:', error);
    }
}

// تابع دریافت آمار اضافی
async function getAdditionalStats() {
    try {
        const { contract } = await window.connectWallet();
        
        // استفاده از متغیرهای موجود در قرارداد جدید
        const [wallets] = await Promise.all([
            contract.wallets().catch(() => 0n)
        ]);
        
        // دریافت totalClaimableBinaryPoints به صورت جداگانه (متغیر state)
        let totalClaimableBinaryPoints = 0n;
        try {
            totalClaimableBinaryPoints = await contract.totalClaimableBinaryPoints();
        } catch (e) {
            console.warn('Could not fetch totalClaimableBinaryPoints:', e);
            totalClaimableBinaryPoints = 0n;
        }
        
        return {
            totalDirectDeposits: ethers.formatUnits(totalClaimableBinaryPoints, 18),
            binaryPool: ethers.formatUnits(totalClaimableBinaryPoints, 18) // استفاده از totalClaimableBinaryPoints
        };
    } catch (error) {
        // console.error('Dashboard: Error fetching additional stats:', error);
        return {
            totalDirectDeposits: '0',
            binaryPool: '0'
        };
    }
}

// تابع دریافت حجم معاملات
async function getTradingVolume() {
    try {
        const { contract } = await window.connectWallet();
        const contractMaticBalance = await contract.getContractMaticBalance();
        const formattedBalance = ethers.formatEther(contractMaticBalance);
        
        return formattedBalance;
    } catch (error) {
        // console.error('Dashboard: Error fetching contract balance:', error);
        return '0';
    }
}

// تابع کوتاه کردن آدرس
function shortenAddress(address) {
    if (!address) return '---';
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
}

// تابع شروع نظارت بر اتصال
function startConnectionMonitoring() {
    // بررسی تغییرات اتصال MetaMask
    if (typeof window.ethereum !== 'undefined') {
        window.ethereum.on('accountsChanged', async (accounts) => {
            if (accounts && accounts.length > 0) {
                try {
                    // ریست کردن وضعیت اتصال
                    window.resetConnectionState();
                    
                    // راه‌اندازی مجدد Web3
                    await window.initializeWeb3();
                    
                    // رفرش شبکه بعد از تغییر حساب
                    setTimeout(async () => {
                        try {
                            const connection = await window.connectWallet();
                            if (connection) {
                                await window.refreshNetworkAfterConnection(connection);
                            }
                        } catch (error) {
                            console.warn('Error refreshing network after account change:', error);
                        }
                    }, 2000);
                    
                    // بارگذاری داشبورد اگر آماده است
                    if (!isDashboardLoading) {
                        await loadDashboardData();
                    }
                } catch (error) {
                    // console.error('Error handling account change:', error);
                }
            } else {
                resetDashboard();
            }
        });
        
        window.ethereum.on('chainChanged', async (chainId) => {
            if (chainId === '0x89') {
                try {
                    // ریست کردن وضعیت اتصال
                    window.resetConnectionState();
                    
                    // راه‌اندازی مجدد Web3
                    await window.initializeWeb3();
                    
                    // رفرش شبکه بعد از تغییر شبکه
                    setTimeout(async () => {
                        try {
                            const connection = await window.connectWallet();
                            if (connection) {
                                await window.refreshNetworkAfterConnection(connection);
                            }
                        } catch (error) {
                            console.warn('Error refreshing network after chain change:', error);
                        }
                    }, 2000);
                    
                    // بارگذاری داشبورد اگر آماده است
                    if (!isDashboardLoading) {
                        await loadDashboardData();
                    }
                } catch (error) {
                    // console.error('Error handling chain change:', error);
                }
            } else {
                updateConnectionStatus('error', 'لطفاً به شبکه Polygon متصل شوید');
            }
        });
        
        window.ethereum.on('connect', async (connectInfo) => {
            try {
                // ریست کردن وضعیت اتصال
                window.resetConnectionState();
                
                // راه‌اندازی مجدد Web3
                await window.initializeWeb3();
                
                // رفرش شبکه بعد از اتصال مجدد
                setTimeout(async () => {
                    try {
                        const connection = await window.connectWallet();
                        if (connection) {
                            await window.refreshNetworkAfterConnection(connection);
                        }
                    } catch (error) {
                        console.warn('Error refreshing network after reconnection:', error);
                    }
                }, 2000);
                
                // بارگذاری داشبورد اگر آماده است
                if (!dashboardLoading) {
                    await loadDashboardData();
                }
            } catch (error) {
                // console.error('Error handling connection:', error);
            }
        });
        
        window.ethereum.on('disconnect', (error) => {
            resetDashboard();
        });
    }
    
    // بررسی اتصال WalletConnect
    if (window.walletConnectProvider) {
        window.walletConnectProvider.on('accountsChanged', async (accounts) => {
            if (accounts && accounts.length > 0) {
                try {
                    await handleWalletConnectSuccess(window.walletConnectProvider);
                } catch (error) {
                    // console.error('Error handling WalletConnect success:', error);
                }
            }
        });
        
        window.walletConnectProvider.on('disconnect', (code, reason) => {
            resetDashboard();
        });
    }
}

// تابع مدیریت موفقیت اتصال WalletConnect
async function handleWalletConnectSuccess(walletConnectProvider) {
    try {
        // ایجاد provider و signer
        const provider = new ethers.BrowserProvider(walletConnectProvider);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
            window.contractConfig.IAM_ADDRESS,
            window.contractConfig.IAM_ABI,
            signer
        );
        
        // به‌روزرسانی contractConfig
        window.contractConfig.provider = provider;
        window.contractConfig.signer = signer;
        window.contractConfig.contract = contract;
        window.contractConfig.walletConnectProvider = walletConnectProvider;
        
        // Update user status bar after wallet connection
        if (typeof window.updateUserStatusBar === 'function') {
            setTimeout(() => {
                window.updateUserStatusBar();
            }, 2000);
        }
        
        const address = await signer.getAddress();
        window.contractConfig.address = address;
        
        // ذخیره در localStorage
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletAddress', address);
        localStorage.setItem('walletType', 'walletconnect');
        
        updateConnectionStatus('success', 'Wallet connection successful');
        updateWalletButtonVisibility();
        
        // بارگذاری داده‌های داشبورد فقط اگر waiting نیست
        if (!isDashboardLoading) {
            if (!dashboardInitialized) {
                dashboardInitialized = true;
            }
            await loadDashboardData();
        }
        
        // رفرش شبکه بعد از اتصال موفق WalletConnect
        setTimeout(async () => {
            try {
                const connection = {
                    contract: contract,
                    signer: signer,
                    provider: provider,
                    address: address
                };
                await window.refreshNetworkAfterConnection(connection);
            } catch (error) {
                console.warn('Error refreshing network after WalletConnect connection:', error);
            }
        }, 2000);
        
        return {
            contract: contract,
            signer: signer,
            provider: provider
        };
    } catch (error) {
        // console.error('Error handling WalletConnect success:', error);
        updateConnectionStatus('error', 'Error setting up connection: ' + error.message);
        throw error;
    }
}

// تابع اتصال با QR Code
async function connectWithQRCode() {
    try {
        // بررسی وجود WalletConnectHandler
        if (!window.WalletConnectHandler) {
            // console.error('WalletConnectHandler not found');
            throw new Error('WalletConnect Handler not loaded');
        }
        
        // نمایش debug information
        if (window.WalletConnectHandler.debugWalletConnect) {
            window.WalletConnectHandler.debugWalletConnect();
        }
        
        // به‌روزرسانی وضعیت اتصال
        updateConnectionStatus('info', 'Connecting with WalletConnect...');
        
        // فراخوانی تابع اتصال از WalletConnectHandler
        const provider = await window.WalletConnectHandler.connectWithWalletConnect();
        
        if (provider && provider.connected) {
            // مدیریت موفقیت اتصال
            await handleWalletConnectSuccess(provider);
            
            // به‌روزرسانی وضعیت
            // updateConnectionStatus('success', 'اتصال با WalletConnect موفقیت‌آمیز بود');
            updateWalletButtonVisibility();
            
            return provider;
        } else {
            throw new Error('WalletConnect connection failed - provider not connected');
        }
        
    } catch (error) {
        // console.error('WalletConnect QR connection error:', error);
        
        // نمایش debug information در صورت خطا
        if (window.WalletConnectHandler && window.WalletConnectHandler.debugWalletConnect) {
            window.WalletConnectHandler.debugWalletConnect();
        }
        
        // نمایش خطا به کاربر
        const errorMessage = error.message || 'Error connecting WalletConnect';
        updateConnectionStatus('error', errorMessage);
        
        // به‌روزرسانی UI
        updateWalletButtonVisibility();
        
        throw error;
    }
}

// تابع اتصال هوشمند
async function connectWallet() {
    try {
        // بررسی اتصال موجود
        if (window.contractConfig && window.contractConfig.contract && window.contractConfig.address) {
            return window.contractConfig;
        }
        
        // استفاده از تابع smartConnect از walletconnect-handler
        if (typeof smartConnect === 'function') {
            const result = await smartConnect();
            if (result) {
                // اگر smartConnect موفق بود، contractConfig باید تنظیم شده باشد
                if (window.contractConfig && window.contractConfig.contract) {
                    return window.contractConfig;
                }
            }
        }
        
        // fallback به روش قدیمی
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });
                
                if (accounts && accounts.length > 0) {
                    await window.initializeWeb3();
                    
                    // بررسی اینکه آیا contractConfig تنظیم شده است
                    if (window.contractConfig && window.contractConfig.contract) {
                        return window.contractConfig;
                    }
                }
            } catch (error) {
                // console.error('MetaMask connection failed:', error);
            }
        }
        
        return null;
        
    } catch (error) {
        // console.error('Wallet connection failed:', error);
        return null;
    }
}

// تابع بارگذاری صفحه اصلی
async function loadHomepage() {
    try {
        // انتظار برای اتصال کیف پول
        await waitForWalletConnection();
        
        // بارگذاری داده‌های داشبورد
        await loadDashboardData();
        
        // شروع به‌روزرسانی خودکار - غیرفعال شده
        // startDashboardAutoUpdate();
        
    } catch (error) {
        // console.error('Error loading homepage:', error);
    }
}

// تابع اتصال خودکار کیف پول
async function autoConnectWallet() {
    try {
        // بررسی اتصال موجود
        if (window.contractConfig && window.contractConfig.address) {
            return true;
        }
        
        // بررسی MetaMask
        if (typeof window.ethereum !== 'undefined') {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
                await window.initializeWeb3();
                return true;
            }
        }
        
        return false;
        
    } catch (error) {
        // console.error('Auto-connect failed:', error);
        return false;
    }
}

// Add after DOMContentLoaded or main dashboard load logic:
async function updateDAIContractBalance() {
  try {
    // Wait for wallet connection and contract
    let contract = null;
    if (window.contractConfig && window.contractConfig.contract) {
      contract = window.contractConfig.contract;
    } else if (typeof window.connectWallet === 'function') {
      const conn = await window.connectWallet();
      contract = conn && conn.contract ? conn.contract : null;
    }
    if (!contract) return;
    // Try correct function name first, then fallback
    let daiBalance;
    if (typeof contract.getContractdaiBalance === 'function') {
      daiBalance = await contract.getContractdaiBalance();
    } else if (typeof contract.getContractDAIBalance === 'function') {
      daiBalance = await contract.getContractDAIBalance();
            } else {
            // Fallback to direct DAI contract call
            const daiContract = new ethers.Contract(window.DAI_ADDRESS, window.DAI_ABI, contract.provider);
            daiBalance = await daiContract.balanceOf(contract.target);
        }
            // DAI has 18 decimals
        const daiFormatted = (Number(daiBalance) / 1e18).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        const el = document.getElementById('dashboard-dai-balance');
        if (el) el.textContent = daiFormatted;
  } catch (e) {
    const el = document.getElementById('dashboard-dai-balance');
    if (el) el.textContent = '-';
  }
}
document.addEventListener('DOMContentLoaded', updateDAIContractBalance);

// اضافه کردن event listener برای بارگذاری صفحه
document.addEventListener('DOMContentLoaded', function() {
    // تلاش برای اتصال خودکار ولت
    autoConnectWallet();
    // تاخیر کوتاه برای اطمینان از بارگذاری کامل
    setTimeout(() => {
        // به‌روزرسانی نمایش دکمه‌های کیف پول در زمان بارگذاری
        updateWalletButtonVisibility();
        // شروع نظارت بر وضعیت اتصال
        startConnectionMonitoring();
        // فراخوانی loadHomepage - غیرفعال شده
// loadHomepage();
    }, 500);
});

