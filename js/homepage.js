// homepage.js
// سایر کدهای مربوط به داشبورد و آمار و ... (کدهای expand/collapse و marquee حذف شدند)
// ...

// homepage.js - بارگذاری داده‌های داشبورد و آمار پلتفرم
let dashboardLoading = false;
let dashboardInitialized = false;
let lastDashboardUpdate = 0;
let dashboardUpdateInterval = null;
const DASHBOARD_UPDATE_INTERVAL = 30000; // 30 seconds minimum between updates

// تابع به‌روزرسانی وضعیت اتصال
function updateConnectionStatus(type, message) {
    try {
        const statusElement = document.getElementById('connection-status');
        if (!statusElement) {
            console.log('Connection status element not found');
            return;
        }
        
        // پاک کردن کلاس‌های قبلی
        statusElement.className = 'connection-status';
        
        // اضافه کردن کلاس مناسب
        switch (type) {
            case 'success':
                statusElement.classList.add('success');
                break;
            case 'error':
                statusElement.classList.add('error');
                break;
            case 'warning':
                statusElement.classList.add('warning');
                break;
            case 'info':
            default:
                statusElement.classList.add('info');
                break;
        }
        
        // تنظیم متن
        statusElement.textContent = message;
        statusElement.style.display = 'block';
        
        console.log(`Connection status updated: ${type} - ${message}`);
        
    } catch (error) {
        console.error('Error updating connection status:', error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log("Homepage loaded, waiting for wallet connection...");
        
        // به‌روزرسانی نمایش دکمه‌های کیف پول
        if (window.WalletConnectHandler) {
            window.WalletConnectHandler.updateWalletButtonVisibility();
        }
        
        // شروع نظارت بر تغییرات اتصال
        startConnectionMonitoring();
        
        // منتظر اتصال کیف پول بمان
        const walletConnected = await waitForWalletConnection();
        
        if (walletConnected) {
            console.log("Wallet connected, loading dashboard data...");
            // بارگذاری داده‌های داشبورد
            await loadDashboardData();
            dashboardInitialized = true;

            // به‌روزرسانی خودکار هر 30 ثانیه
            startDashboardAutoUpdate();
        } else {
            console.log("Wallet connection timeout, will retry when wallet connects...");
            // شروع نظارت بر اتصال
            startConnectionMonitoring();
        }

    } catch (error) {
        console.error("Error in homepage:", error);
    }
});

// تابع شروع به‌روزرسانی خودکار داشبورد
function startDashboardAutoUpdate() {
    // پاک کردن interval قبلی اگر وجود دارد
    if (dashboardUpdateInterval) {
        clearInterval(dashboardUpdateInterval);
    }
    
    // شروع interval جدید
    dashboardUpdateInterval = setInterval(async () => {
        if (!dashboardLoading && dashboardInitialized && checkWalletConnectionStatus()) {
            console.log('Auto-updating dashboard...');
            await loadDashboardData();
        }
    }, 30000); // هر 30 ثانیه
}

// تابع توقف به‌روزرسانی خودکار داشبورد
function stopDashboardAutoUpdate() {
    if (dashboardUpdateInterval) {
        clearInterval(dashboardUpdateInterval);
        dashboardUpdateInterval = null;
    }
}

// تابع انتظار برای اتصال کیف پول
async function waitForWalletConnection() {
    return new Promise((resolve) => {
        console.log('Wallet connection in progress, waiting...');
        
        // بررسی اولیه اتصال
        if (checkWalletConnectionStatus()) {
            console.log('Connection already established');
            resolve(true);
            return;
        }
        
        let timeoutId;
        let checkInterval;
        
        // تنظیم timeout
        timeoutId = setTimeout(() => {
            console.log('Wallet connection timeout, will retry when wallet connects...');
            clearInterval(checkInterval);
            resolve(false);
        }, 5000); // 5 ثانیه timeout
        
        // بررسی مداوم اتصال
        checkInterval = setInterval(() => {
            if (checkWalletConnectionStatus()) {
                console.log('Connection completed while waiting');
                clearTimeout(timeoutId);
                clearInterval(checkInterval);
                resolve(true);
            }
        }, 500); // بررسی هر 500 میلی‌ثانیه
        
        // بررسی اتصال MetaMask
        if (typeof window.ethereum !== 'undefined') {
            window.ethereum.once('accountsChanged', (accounts) => {
                if (accounts && accounts.length > 0) {
                    console.log('MetaMask connected during wait');
                    clearTimeout(timeoutId);
                    clearInterval(checkInterval);
                    resolve(true);
                }
            });
        }
    });
}

// تابع بارگذاری داده‌های داشبورد
async function loadDashboardData() {
    try {
        // بررسی اینکه آیا در حال بارگذاری هستیم
        if (dashboardLoading) {
            console.log('Dashboard already loading, skipping...');
            return;
        }
        
        // بررسی فاصله زمانی از آخرین به‌روزرسانی
        const now = Date.now();
        if (now - lastDashboardUpdate < DASHBOARD_UPDATE_INTERVAL) {
            console.log('Dashboard updated recently, skipping...');
            return;
        }
        
        console.log('Loading dashboard data...');
        dashboardLoading = true;
        
        // بررسی اتصال کیف پول
        if (!checkWalletConnectionStatus()) {
            console.log('No wallet connection, skipping dashboard load');
            dashboardLoading = false;
            return;
        }
        
        // بررسی اینکه آیا contractConfig آماده است
        if (!window.contractConfig || !window.contractConfig.contract) {
            console.log('Contract not ready, waiting for initialization...');
            dashboardLoading = false;
            return;
        }
        
        console.log('Fetching dashboard data...');
        
        // دریافت قیمت‌ها
        const prices = await getPrices();
        console.log('Prices fetched:', prices);
        
        // دریافت آمار قرارداد
        const stats = await getContractStats();
        console.log('Contract stats fetched:', stats);
        
        // دریافت آمار اضافی
        const additionalStats = await getAdditionalStats();
        console.log('Additional stats fetched:', additionalStats);
        
        // دریافت حجم معاملات
        const tradingVolume = await getTradingVolume();
        console.log('Trading volume fetched:', tradingVolume);
        
        // محاسبه تغییرات قیمت
        const priceChanges = await calculatePriceChanges();
        console.log('Price changes calculated:', priceChanges);
        
        // به‌روزرسانی UI
        updateDashboardUI(prices, stats, additionalStats, tradingVolume, priceChanges);
        
        // به‌روزرسانی timestamp
        lastDashboardUpdate = now;
        
        // اگر این اولین بار است که داشبورد بارگذاری می‌شود، شروع به‌روزرسانی خودکار
        if (!dashboardInitialized) {
            dashboardInitialized = true;
            startDashboardAutoUpdate();
        }
        
        console.log('Dashboard data loaded successfully');
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        
        // نمایش خطا به کاربر
        const errorMessage = error.message || 'خطا در بارگذاری داده‌های داشبورد';
        updateConnectionStatus('error', errorMessage);
        
        // تلاش مجدد بعد از 5 ثانیه فقط اگر اتصال وجود دارد
        setTimeout(() => {
            if (checkWalletConnectionStatus() && !dashboardLoading) {
                console.log('Retrying dashboard data load...');
                loadDashboardData();
            }
        }, 5000);
    } finally {
        dashboardLoading = false;
    }
}

// تابع محاسبه درصد تغییرات قیمت
async function calculatePriceChanges() {
    try {
        // در اینجا می‌توانید قیمت‌های قبلی را از localStorage یا API دریافت کنید
        const previousPrices = JSON.parse(localStorage.getItem('previousPrices') || '{}');
        const currentTime = Date.now();
        
        // اگر قیمت‌های قبلی وجود ندارند یا قدیمی هستند، از قیمت فعلی استفاده کنید
        if (!previousPrices.timestamp || (currentTime - previousPrices.timestamp) > 3600000) { // 1 ساعت
            const currentPrices = await getPrices();
            const newPreviousPrices = {
                tokenPriceUSD: currentPrices.tokenPriceUSD,
                tokenPriceMATIC: currentPrices.tokenPrice,
                timestamp: currentTime
            };
            localStorage.setItem('previousPrices', JSON.stringify(newPreviousPrices));
            
            return {
                usdChange: 0,
                maticChange: 0,
                usdChangePercent: 0,
                maticChangePercent: 0
            };
        }
        
        const currentPrices = await getPrices();
        
        // محاسبه تغییرات USD
        const usdChange = parseFloat(currentPrices.tokenPriceUSD) - parseFloat(previousPrices.tokenPriceUSD);
        const usdChangePercent = previousPrices.tokenPriceUSD > 0 ? 
            (usdChange / parseFloat(previousPrices.tokenPriceUSD)) * 100 : 0;
        
        // محاسبه تغییرات MATIC
        const maticChange = parseFloat(currentPrices.tokenPrice) - parseFloat(previousPrices.tokenPriceMATIC);
        const maticChangePercent = previousPrices.tokenPriceMATIC > 0 ? 
            (maticChange / parseFloat(previousPrices.tokenPriceMATIC)) * 100 : 0;
        
        // ذخیره قیمت‌های فعلی برای محاسبه بعدی
        const newPreviousPrices = {
            tokenPriceUSD: currentPrices.tokenPriceUSD,
            tokenPriceMATIC: currentPrices.tokenPrice,
            timestamp: currentTime
        };
        localStorage.setItem('previousPrices', JSON.stringify(newPreviousPrices));
        
        return {
            usdChange,
            maticChange,
            usdChangePercent,
            maticChangePercent
        };
        
            } catch (error) {
        console.error("Error calculating price changes:", error);
        return {
            usdChange: 0,
            maticChange: 0,
            usdChangePercent: 0,
            maticChangePercent: 0
        };
    }
}

// تابع به‌روزرسانی UI داشبورد
function updateDashboardUI(prices, stats, additionalStats, tradingVolume, priceChanges) {
    const updateElement = (id, value, prefix = '', suffix = '', isInteger = false) => {
        const element = document.getElementById(id);
        if (element) {
            // اگر مقدار undefined یا null است، نمایش "-"
            if (value === undefined || value === null || isNaN(value)) {
                element.textContent = '-';
                return;
            }
            
            if (typeof value === 'number') {
                let displayValue;
                if (isInteger) {
                    // برای اعداد صحیح (مثل تعداد کاربران)
                    displayValue = `${prefix}${Math.round(value)}${suffix}`;
                } else if (value >= 1000000) {
                    displayValue = `${prefix}${(value / 1000000).toFixed(2)}M${suffix}`;
                } else if (value >= 1000) {
                    displayValue = `${prefix}${(value / 1000).toFixed(2)}K${suffix}`;
                } else {
                    displayValue = `${prefix}${value.toFixed(4)}${suffix}`;
                }
                element.textContent = displayValue;
            } else {
                element.textContent = `${prefix}${value}${suffix}`;
            }
        }
    };

    // به‌روزرسانی قیمت‌ها
    if (prices) {
        updateElement('token-price', parseFloat(prices.tokenPriceUSD), '$');
        updateElement('token-price-matic', parseFloat(prices.tokenPrice), '', ' MATIC');
    }

    // به‌روزرسانی آمار قرارداد
    if (stats) {
        // توکن‌های در گردش - باید کل عرضه باشد (چون همه توکن‌ها در گردش هستند)
        const totalSupply = parseFloat(stats.totalSupply);
        updateElement('circulating-supply', totalSupply);
        
        // تعداد کاربران - بدون اعشار
        updateElement('total-points', parseInt(stats.totalUsers), '', '', true);
        
        // پوینت‌های پرداخت شده - این مقدار از قرارداد دریافت می‌شود
        updateElement('claimed-points', parseFloat(stats.totalPoints));
        
        // پوینت‌های باقی‌مانده - باید صفر باشد (چون همه توکن‌ها در گردش هستند)
        updateElement('remaining-points', 0);
        
        // ارزش پوینت
        updateElement('point-value', parseFloat(additionalStats?.pointValue || 0), '$');
        
        // استخر پاداش - با واحد توکن LVL
        updateElement('reward-pool', parseFloat(stats.rewardPool), '', ' LVL');
    }

    // به‌روزرسانی موجودی قرارداد
    if (tradingVolume) {
        updateElement('trading-volume', parseFloat(tradingVolume.contractBalance || 0), '', ' MATIC');
    }
}

// تابع بررسی وضعیت اتصال کیف پول
function checkWalletConnectionStatus() {
    try {
        // بررسی contractConfig
        if (!window.contractConfig) {
            return false;
        }
        
        // بررسی وجود provider، signer، contract و address
        if (!window.contractConfig.provider || 
            !window.contractConfig.signer || 
            !window.contractConfig.contract || 
            !window.contractConfig.address) {
            return false;
        }
        
        // بررسی اتصال MetaMask
        if (typeof window.ethereum !== 'undefined') {
            try {
                // بررسی اینکه آیا MetaMask متصل است
                if (window.ethereum.isConnected && window.ethereum.isConnected()) {
                    return true;
                }
                
                // بررسی آدرس‌های موجود
                if (window.ethereum.selectedAddress) {
                    return true;
                }
            } catch (error) {
                console.log('MetaMask connection check error:', error);
            }
        }
        
        // بررسی اتصال WalletConnect
        if (window.contractConfig.walletConnectProvider) {
            try {
                if (window.contractConfig.walletConnectProvider.connected) {
                    return true;
                }
            } catch (error) {
                console.log('WalletConnect connection check error:', error);
            }
        }
        
        // بررسی localStorage به عنوان fallback
        const wasConnected = localStorage.getItem('walletConnected') === 'true';
        const hasAddress = localStorage.getItem('walletAddress');
        
        if (wasConnected && hasAddress && window.contractConfig.address === hasAddress) {
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error checking wallet connection status:', error);
        return false;
    }
}

// تابع به‌روزرسانی نمایش دکمه‌های کیف پول
function updateWalletButtonVisibility() {
    try {
        const isConnected = checkWalletConnectionStatus();
        
        const qrConnectBtn = document.getElementById('qr-connect-btn');
        const smartConnectBtn = document.getElementById('smart-connect-btn');
        const disconnectBtn = document.getElementById('disconnect-btn');
        const statusElement = document.getElementById('connection-status');
        
        if (isConnected) {
            // کیف پول متصل است
            if (qrConnectBtn) qrConnectBtn.style.display = 'none';
            if (smartConnectBtn) smartConnectBtn.style.display = 'none';
            if (disconnectBtn) disconnectBtn.style.display = 'inline-block';
            
            // نمایش وضعیت اتصال
            if (statusElement) {
                statusElement.style.display = 'block';
                statusElement.className = 'connection-status success';
                statusElement.textContent = 'کیف پول متصل است';
            }
        } else {
            // کیف پول متصل نیست
            if (qrConnectBtn) qrConnectBtn.style.display = 'inline-block';
            if (smartConnectBtn) smartConnectBtn.style.display = 'inline-block';
            if (disconnectBtn) disconnectBtn.style.display = 'none';
            
            // نمایش وضعیت اتصال
            if (statusElement) {
                statusElement.style.display = 'block';
                statusElement.className = 'connection-status info';
                statusElement.textContent = 'لطفاً کیف پول خود را متصل کنید';
            }
        }
        
    } catch (error) {
        console.error('Error updating wallet button visibility:', error);
    }
}

// تابع قطع اتصال کیف پول
async function disconnectWallet() {
    try {
        console.log('Disconnecting wallet...');
        
        // قطع اتصال WalletConnect اگر فعال است
        if (typeof disconnectWalletConnect === 'function') {
            try {
                await disconnectWalletConnect();
                console.log('WalletConnect disconnected');
            } catch (error) {
                console.log('WalletConnect disconnect error:', error);
            }
        }
        
        // قطع اتصال MetaMask (فقط پاک کردن داده‌های محلی)
        if (typeof window.ethereum !== 'undefined') {
            try {
                // پاک کردن event listeners
                window.ethereum.removeAllListeners();
                console.log('MetaMask listeners removed');
            } catch (error) {
                console.log('Error removing MetaMask listeners:', error);
            }
        }
        
        // پاک کردن تنظیمات
        if (window.contractConfig) {
            window.contractConfig.provider = null;
            window.contractConfig.signer = null;
            window.contractConfig.contract = null;
            window.contractConfig.address = null;
            window.contractConfig.walletType = null;
        }
        
        // پاک کردن متغیرهای سراسری
        if (window.WalletConnectHandler) {
            window.WalletConnectHandler.walletConnectProvider = null;
            window.WalletConnectHandler.isWalletConnectInitialized = false;
        }
        
        // پاک کردن localStorage
        try {
            localStorage.removeItem('walletConnected');
            localStorage.removeItem('walletAddress');
            localStorage.removeItem('walletType');
            console.log('LocalStorage cleared');
        } catch (error) {
            console.log('Error clearing localStorage:', error);
        }
        
        // به‌روزرسانی UI
        updateConnectionStatus('info', 'اتصال کیف پول قطع شد');
        
        // نمایش دکمه‌های اتصال و مخفی کردن دکمه قطع اتصال
        const qrConnectBtn = document.getElementById('qr-connect-btn');
        const smartConnectBtn = document.getElementById('smart-connect-btn');
        const disconnectBtn = document.getElementById('disconnect-btn');
        
        if (qrConnectBtn) qrConnectBtn.style.display = 'inline-block';
        if (smartConnectBtn) smartConnectBtn.style.display = 'inline-block';
        if (disconnectBtn) disconnectBtn.style.display = 'none';
        
        // ریست کردن داشبورد
        await resetDashboard();
        
        console.log('Wallet disconnected successfully');
        
    } catch (error) {
        console.error('Error disconnecting wallet:', error);
        updateConnectionStatus('error', 'خطا در قطع اتصال: ' + error.message);
    }
}

// تابع ریست کردن داشبورد
async function resetDashboard() {
    try {
        console.log('Resetting dashboard...');
        
        // توقف به‌روزرسانی خودکار
        stopDashboardAutoUpdate();
        
        // ریست کردن متغیرهای وضعیت
        dashboardLoading = false;
        dashboardInitialized = false;
        lastDashboardUpdate = 0;
        
        // پاک کردن داده‌های localStorage
        localStorage.removeItem('walletConnected');
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('walletType');
        localStorage.removeItem('previousPrices');
        
        // پاک کردن contractConfig
        if (window.contractConfig) {
            window.contractConfig.provider = null;
            window.contractConfig.signer = null;
            window.contractConfig.contract = null;
            window.contractConfig.address = null;
            window.contractConfig.walletConnectProvider = null;
        }
        
        // به‌روزرسانی UI
        updateConnectionStatus('disconnected', 'کیف پول قطع شد');
        updateWalletButtonVisibility();
        
        // پاک کردن داده‌های داشبورد
        const dashboardElements = [
            'token-price', 'token-price-matic', 'circulating-supply',
            'total-points', 'claimed-points', 'remaining-points',
            'point-value', 'reward-pool', 'trading-volume'
        ];
        
        dashboardElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = '-';
            }
        });
        
        console.log('Dashboard reset completed');
        
    } catch (error) {
        console.error('Error resetting dashboard:', error);
    }
}

// تابع بررسی و حل تعارض permissions MetaMask
async function handleMetaMaskPermissionConflict() {
    try {
        if (typeof window.ethereum !== 'undefined') {
            // بررسی وضعیت فعلی permissions
            const permissions = await window.ethereum.request({
                method: 'wallet_getPermissions'
            });
            
            console.log('Current MetaMask permissions:', permissions);
            
            // اگر permissions موجود است، نیازی به درخواست مجدد نیست
            if (permissions && permissions.length > 0) {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts && accounts.length > 0) {
                    console.log('MetaMask already has permissions and accounts');
                    return true;
                }
            }
            
            // اگر permissions موجود نیست، درخواست کن
            try {
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });
                console.log('MetaMask permissions granted:', accounts);
                return true;
            } catch (error) {
                if (error.code === -32002) {
                    console.log('MetaMask permission request already pending, waiting...');
                    updateConnectionStatus('info', 'درخواست اتصال MetaMask در حال پردازش است. لطفاً صبر کنید...');
                    
                    // انتظار برای حل شدن تعارض
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    
                    // بررسی مجدد
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    if (accounts && accounts.length > 0) {
                        console.log('MetaMask connection resolved after waiting');
                        return true;
                    }
                }
                throw error;
            }
        }
        return false;
    } catch (error) {
        console.error('Error handling MetaMask permission conflict:', error);
        return false;
    }
}

// تابع پاک کردن درخواست‌های معلق MetaMask
async function clearPendingMetaMaskRequests() {
    try {
        if (typeof window.ethereum !== 'undefined') {
            // تلاش برای دریافت آدرس‌ها بدون درخواست مجوز
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
                console.log('MetaMask already has accounts, no pending requests to clear');
                return true;
            }
            
            // اگر هیچ حسابی متصل نیست، درخواست‌های معلق را نادیده بگیر
            console.log('No MetaMask accounts connected, skipping pending requests');
            return false;
        }
        return false;
    } catch (error) {
        console.log('Error checking MetaMask accounts:', error);
        return false;
    }
}

// تابع بررسی اتصال موجود MetaMask
async function checkExistingMetaMaskConnection() {
    try {
        console.log('MetaMask detected, checking existing connection...');
        
        if (typeof window.ethereum === 'undefined') {
            console.log('MetaMask not available');
            return false;
        }
        
        // بررسی اتصال فعلی بدون درخواست مجوز
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
            console.log('MetaMask already connected with accounts:', accounts);
            return true;
        } else {
            console.log('MetaMask detected but no accounts connected');
            return false;
        }
    } catch (error) {
        console.log('Error checking MetaMask connection:', error);
        return false;
    }
}

// تابع بارگذاری صفحه اصلی
async function loadHomepage() {
    try {
        console.log('Loading homepage...');
        
        // پاک کردن درخواست‌های معلق
        await clearPendingMetaMaskRequests();
        
        // بررسی اتصال فعلی
        const isConnected = await checkExistingMetaMaskConnection();
        
        if (isConnected) {
            console.log('Wallet already connected, loading dashboard...');
            if (!dashboardLoading) {
                await loadDashboardData();
            }
        } else {
            console.log('No wallet connection, starting connection monitoring...');
            startConnectionMonitoring();
        }
        
        console.log('Homepage loaded successfully');
    } catch (error) {
        console.error('Error loading homepage:', error);
        updateConnectionStatus('error', 'خطا در بارگذاری صفحه اصلی');
    }
}

// تابع شروع نظارت بر اتصال
function startConnectionMonitoring() {
    console.log('Starting connection monitoring...');
    
    // بررسی تغییرات اتصال MetaMask
    if (typeof window.ethereum !== 'undefined') {
        window.ethereum.on('accountsChanged', async (accounts) => {
            console.log('MetaMask accounts changed:', accounts);
            if (accounts && accounts.length > 0) {
                console.log('New account connected, loading dashboard...');
                try {
                    // فقط اگر داشبورد در حال بارگذاری نیست
                    if (!dashboardLoading) {
                        await loadDashboardData();
                    }
                } catch (error) {
                    console.error('Error loading dashboard after account change:', error);
                }
            } else {
                console.log('All accounts disconnected, resetting dashboard...');
                resetDashboard();
            }
        });
        
        window.ethereum.on('chainChanged', async (chainId) => {
            console.log('MetaMask chain changed:', chainId);
            if (chainId === '0x89') {
                console.log('Connected to Polygon, loading dashboard...');
                try {
                    // فقط اگر داشبورد در حال بارگذاری نیست
                    if (!dashboardLoading) {
                        await loadDashboardData();
                    }
                } catch (error) {
                    console.error('Error loading dashboard after chain change:', error);
                }
            } else {
                console.log('Not on Polygon network, showing error...');
                updateConnectionStatus('error', 'لطفاً به شبکه Polygon متصل شوید');
            }
        });
        
        window.ethereum.on('connect', async (connectInfo) => {
            console.log('MetaMask connected:', connectInfo);
            try {
                // فقط اگر داشبورد در حال بارگذاری نیست
                if (!dashboardLoading) {
                    await loadDashboardData();
                }
            } catch (error) {
                console.error('Error loading dashboard after connection:', error);
            }
        });
        
        window.ethereum.on('disconnect', (error) => {
            console.log('MetaMask disconnected:', error);
            resetDashboard();
        });
    }
    
    // بررسی اتصال WalletConnect
    if (window.walletConnectProvider) {
        window.walletConnectProvider.on('accountsChanged', async (accounts) => {
            console.log('WalletConnect accounts changed:', accounts);
            if (accounts && accounts.length > 0) {
                try {
                    await handleWalletConnectSuccess(window.walletConnectProvider);
                } catch (error) {
                    console.error('Error handling WalletConnect success:', error);
                }
            }
        });
        
        window.walletConnectProvider.on('disconnect', (code, reason) => {
            console.log('WalletConnect disconnected:', code, reason);
            resetDashboard();
        });
    }
}

// تابع مدیریت موفقیت اتصال WalletConnect
async function handleWalletConnectSuccess(walletConnectProvider) {
    try {
        console.log('Handling WalletConnect success...');
        
        // ایجاد provider و signer
        const provider = new ethers.BrowserProvider(walletConnectProvider);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
            window.contractConfig.CONTRACT_ADDRESS,
            window.contractConfig.LEVELUP_ABI,
            signer
        );
        
        // به‌روزرسانی contractConfig
        window.contractConfig.provider = provider;
        window.contractConfig.signer = signer;
        window.contractConfig.contract = contract;
        window.contractConfig.walletConnectProvider = walletConnectProvider;
        
        const address = await signer.getAddress();
        window.contractConfig.address = address;
        
        // ذخیره در localStorage
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletAddress', address);
        localStorage.setItem('walletType', 'walletconnect');
        
        console.log('WalletConnect connection successful');
        updateConnectionStatus('success', 'اتصال با کیف پول موفقیت‌آمیز بود');
        updateWalletButtonVisibility();
        
        // بارگذاری داده‌های داشبورد فقط اگر در حال بارگذاری نیست
        if (!dashboardLoading) {
            if (!dashboardInitialized) {
                dashboardInitialized = true;
            }
            await loadDashboardData();
        }
        
        return {
            contract: contract,
            signer: signer,
            provider: provider
        };
    } catch (error) {
        console.error('Error handling WalletConnect success:', error);
        updateConnectionStatus('error', 'خطا در تنظیم اتصال: ' + error.message);
        throw error;
    }
}

// تابع اتصال با QR Code
async function connectWithQRCode() {
    try {
        console.log('Attempting WalletConnect QR connection...');
        
        // بررسی وجود WalletConnectHandler
        if (!window.WalletConnectHandler) {
            console.error('WalletConnectHandler not found');
            throw new Error('WalletConnect Handler not loaded');
        }
        
        // نمایش debug information
        if (window.WalletConnectHandler.debugWalletConnect) {
            window.WalletConnectHandler.debugWalletConnect();
        }
        
        // به‌روزرسانی وضعیت اتصال
        updateConnectionStatus('info', 'در حال اتصال با WalletConnect...');
        
        // فراخوانی تابع اتصال از WalletConnectHandler
        const provider = await window.WalletConnectHandler.connectWithWalletConnect();
        
        if (provider && provider.connected) {
            console.log('WalletConnect QR connection successful');
            
            // مدیریت موفقیت اتصال
            await handleWalletConnectSuccess(provider);
            
            // به‌روزرسانی وضعیت
            updateConnectionStatus('success', 'اتصال با WalletConnect موفقیت‌آمیز بود');
            updateWalletButtonVisibility();
            
            return provider;
        } else {
            throw new Error('WalletConnect connection failed - provider not connected');
        }
        
    } catch (error) {
        console.error('WalletConnect QR connection error:', error);
        
        // نمایش debug information در صورت خطا
        if (window.WalletConnectHandler && window.WalletConnectHandler.debugWalletConnect) {
            window.WalletConnectHandler.debugWalletConnect();
        }
        
        // نمایش خطا به کاربر
        const errorMessage = error.message || 'خطا در اتصال WalletConnect';
        updateConnectionStatus('error', errorMessage);
        
        // به‌روزرسانی UI
        updateWalletButtonVisibility();
        
        throw error;
    }
}

// تابع اتصال هوشمند
async function connectWallet() {
    try {
        console.log('Attempting smart connect...');
        
        // استفاده از تابع smartConnect از walletconnect-handler
        if (typeof smartConnect === 'function') {
            const result = await smartConnect();
            if (result) {
                console.log(`Connected with ${result}`);
                return result;
            }
        }
        
        // fallback به روش قدیمی
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });
                
                if (accounts && accounts.length > 0) {
                    console.log('MetaMask connected');
                    return 'metamask';
                }
            } catch (error) {
                console.error('MetaMask connection failed:', error);
            }
        }
        
        console.log('No wallet connected');
        return null;
        
    } catch (error) {
        console.error('Wallet connection failed:', error);
        return null;
    }
}

// تابع اتصال خودکار کیف پول
async function autoConnectWallet() {
    try {
        console.log('Attempting auto-connect...');
        
        // بررسی اتصال MetaMask موجود
        const isMetaMaskConnected = await checkExistingMetaMaskConnection();
        if (isMetaMaskConnected) {
            console.log('MetaMask already connected, initializing...');
            try {
                await initializeWeb3();
                if (!dashboardLoading) {
                    await loadDashboardData();
                }
                return;
            } catch (error) {
                console.log('Failed to initialize with existing MetaMask connection:', error);
            }
        }
        
        // بررسی اتصال WalletConnect موجود
        if (typeof window.WalletConnectHandler !== 'undefined' && 
            window.WalletConnectHandler.walletConnectProvider && 
            window.WalletConnectHandler.walletConnectProvider.connected) {
            console.log('WalletConnect already connected, initializing...');
            try {
                await initializeWeb3();
                if (!dashboardLoading) {
                    await loadDashboardData();
                }
                return;
            } catch (error) {
                console.log('Failed to initialize with existing WalletConnect connection:', error);
            }
        }
        
        // تلاش برای اتصال جدید
        const connectionResult = await connectWallet();
        if (connectionResult) {
            console.log(`Auto-connected with ${connectionResult}`);
            await initializeWeb3();
            if (!dashboardLoading) {
                await loadDashboardData();
            }
        } else {
            console.log('Auto-connect failed, will retry when wallet connects');
        }
        
    } catch (error) {
        console.error('Auto-connect failed:', error);
    }
}

// اضافه کردن event listener برای بارگذاری صفحه
document.addEventListener('DOMContentLoaded', function() {
    // تاخیر کوتاه برای اطمینان از بارگذاری کامل
    setTimeout(() => {
        // به‌روزرسانی نمایش دکمه‌های کیف پول در زمان بارگذاری
        updateWalletButtonVisibility();
        
        // شروع نظارت بر وضعیت اتصال
        startConnectionMonitoring();
        
        // فراخوانی loadHomepage
        loadHomepage();
    }, 500);
});