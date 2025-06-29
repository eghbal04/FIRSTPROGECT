// homepage.js
// سایر کدهای مربوط به داشبورد و آمار و ... (کدهای expand/collapse و marquee حذف شدند)
// ...

// homepage.js - بارگذاری داده‌های داشبورد و آمار پلتفرم
let dashboardLoading = false;
let dashboardInitialized = false;
let lastDashboardUpdate = 0;
let lastConnectionAttempt = 0;
let dashboardUpdateInterval = null;
const CONNECTION_COOLDOWN = 3000; // 3 seconds cooldown between connection attempts
const DASHBOARD_UPDATE_INTERVAL = 30000; // 30 seconds between dashboard updates

// متغیرهای سراسری
let isDashboardLoading = false;

// تابع به‌روزرسانی وضعیت اتصال
function updateConnectionStatus(type, message) {
    const statusElement = document.getElementById('connection-status');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `connection-status ${type}`;
        statusElement.style.display = 'block';
        
        // پاک کردن پیام بعد از 5 ثانیه
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 5000);
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
    if (dashboardUpdateInterval) {
        clearInterval(dashboardUpdateInterval);
    }
    
    dashboardUpdateInterval = setInterval(async () => {
        try {
            await loadDashboardData();
        } catch (error) {
            console.error('Dashboard auto-update error:', error);
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
    let attempts = 0;
    const maxAttempts = 30; // 30 ثانیه
    
    while (attempts < maxAttempts) {
        try {
            const result = await window.checkConnection();
            if (result.connected) {
                console.log('Dashboard: Wallet connected, loading data...');
                return result;
            }
        } catch (error) {
            console.log('Dashboard: Waiting for wallet connection...', attempts + 1);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
    }
    
    throw new Error('Dashboard: Timeout waiting for wallet connection');
}

// تابع بارگذاری داده‌های داشبورد
async function loadDashboardData() {
    if (isDashboardLoading) {
        return;
    }
    
    isDashboardLoading = true;
    
    try {
        console.log('Dashboard: Loading dashboard data...');
        
        // انتظار برای اتصال کیف پول
        await waitForWalletConnection();
        
        // دریافت داده‌ها به صورت موازی
        const [prices, stats, additionalStats, tradingVolume] = await Promise.all([
            window.getPrices(),
            window.getContractStats(),
            getAdditionalStats(),
            getTradingVolume()
        ]);
        
        // Debug logging برای بررسی مقادیر
        console.log('Dashboard: Contract stats received:', stats);
        console.log('Dashboard: Circulating supply:', stats.circulatingSupply);
        console.log('Dashboard: Total supply:', stats.totalSupply);
        
        // محاسبه تغییرات قیمت
        const priceChanges = await calculatePriceChanges();
        
        // به‌روزرسانی UI
        updateDashboardUI(prices, stats, additionalStats, tradingVolume, priceChanges);
        
        console.log('Dashboard: Data loaded successfully');
        
    } catch (error) {
        console.error('Dashboard: Error loading data:', error);
        updateConnectionStatus('error', 'خطا در بارگذاری داده‌های داشبورد');
    } finally {
        isDashboardLoading = false;
    }
}

// تابع محاسبه تغییرات قیمت
async function calculatePriceChanges() {
    try {
        // در اینجا می‌توانید تغییرات قیمت را محاسبه کنید
        // برای مثال، مقایسه با قیمت قبلی یا میانگین قیمت‌ها
        
        return {
            lvlPriceChange: '0%',
            maticPriceChange: '0%',
            volumeChange: '0%'
        };
    } catch (error) {
        console.error('Dashboard: Error calculating price changes:', error);
        return {
            lvlPriceChange: '0%',
            maticPriceChange: '0%',
            volumeChange: '0%'
        };
    }
}

// تابع به‌روزرسانی UI داشبورد
function updateDashboardUI(prices, stats, additionalStats, tradingVolume, priceChanges) {
    const safeFormat = (val, prefix = '', suffix = '', isInteger = false, maxDecimals = 4) => {
        if (val === undefined || val === null || val === 'undefined' || val === '' || isNaN(val)) return '-';
        if (typeof val === 'string' && val.trim() === '') return '-';
        if (typeof val === 'number') {
            if (isInteger) {
                return prefix + Math.round(val).toLocaleString() + suffix;
            } else {
                return prefix + val.toFixed(maxDecimals).replace(/\.?0+$/, '') + suffix;
            }
        }
        return prefix + val + suffix;
    };
    const updateElement = (id, value, prefix = '', suffix = '', isInteger = false, maxDecimals = 4) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = safeFormat(value, prefix, suffix, isInteger, maxDecimals);
        }
    };
    
    // به‌روزرسانی قیمت‌ها
    updateElement('token-price', prices.lvlPriceUSD, '$', '', false, 6);
    // نمایش قیمت توکن به POL با نماد علمی
    const updateElementExponential = (id, value, suffix = '') => {
        const element = document.getElementById(id);
        if (element) {
            if (value === undefined || value === null || value === 'undefined' || value === '' || isNaN(value)) {
                element.textContent = '-';
            } else {
                const num = parseFloat(value);
                if (isNaN(num)) {
                    element.textContent = value + suffix;
                } else {
                    // اگر مقدار خیلی بزرگ بود، با E نمایش بده
                    if (num >= 1e6) {
                        element.textContent = num.toExponential(3) + suffix;
                    } else {
                        element.textContent = num.toLocaleString('en-US', { maximumFractionDigits: 6 }) + suffix;
                    }
                }
            }
        }
    };
    updateElementExponential('token-price-matic', prices.lvlPriceMatic, ' POL');
    
    // به‌روزرسانی آمار قرارداد
    // نمایش circulating-supply با نماد علمی (E notation)
    updateElementExponential('circulating-supply', stats.circulatingSupply, ' LVL');
    updateElement('total-users', stats.totalUsers, '', '', true);
    // نمایش پوینت‌ها به صورت عدد صحیح (بدون اعشار)
    updateElement('total-points', Math.round(parseFloat(stats.totalPoints)), '', '', true);
    updateElement('claimed-points', Math.round(parseFloat(stats.totalClaimableBinaryPoints)), '', '', true);
    updateElement('remaining-points', Math.round(parseFloat(stats.totalPoints) - parseFloat(stats.totalClaimableBinaryPoints)), '', '', true);
    updateElement('trading-volume', tradingVolume, '', ' POL', false, 4);
    let pointValueLVL = '-';
    let rewardPoolLVL = '-';
    if (parseFloat(prices.lvlPriceMatic) > 0) {
        pointValueLVL = parseFloat(stats.pointValue) / parseFloat(prices.lvlPriceMatic);
        rewardPoolLVL = parseFloat(stats.rewardPool) / parseFloat(prices.lvlPriceMatic);
    }
    updateElement('point-value', pointValueLVL, '', ' LVL', false, 6);
    updateElement('reward-pool', rewardPoolLVL, '', ' LVL', false, 4);
}

// تابع بررسی وضعیت اتصال کیف پول
function checkWalletConnectionStatus() {
    try {
        if (window.contractConfig && window.contractConfig.address) {
            updateConnectionStatus('success', `متصل به: ${shortenAddress(window.contractConfig.address)}`);
            return true;
        } else {
            updateConnectionStatus('info', 'کیف پول متصل نیست');
            return false;
        }
    } catch (error) {
        console.error('Dashboard: Error checking wallet status:', error);
        updateConnectionStatus('error', 'خطا در بررسی وضعیت کیف پول');
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
        console.log('Dashboard: Disconnecting wallet...');
        
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
        updateConnectionStatus('info', 'کیف پول قطع شد');
        
        console.log('Dashboard: Wallet disconnected successfully');
        
    } catch (error) {
        console.error('Dashboard: Error disconnecting wallet:', error);
        updateConnectionStatus('error', 'خطا در قطع اتصال کیف پول');
    }
}

// تابع بازنشانی داشبورد
async function resetDashboard() {
    try {
        // پاک کردن همه مقادیر
        const elements = [
            'token-price', 'token-price-matic', 'circulating-supply',
            'total-users', 'total-points', 'claimed-points', 'remaining-points',
            'trading-volume', 'point-value', 'reward-pool'
        ];
        
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = '-';
            }
        });
        
        console.log('Dashboard: Reset successfully');
        
    } catch (error) {
        console.error('Dashboard: Error resetting dashboard:', error);
    }
}

// تابع دریافت آمار اضافی
async function getAdditionalStats() {
    try {
        const { contract } = await window.connectWallet();
        
        const [totalDirectDeposits, binaryPool] = await Promise.all([
            contract.totalDirectDeposits(),
            contract.binaryPool()
        ]);
        
        return {
            totalDirectDeposits: ethers.formatEther(totalDirectDeposits),
            binaryPool: ethers.formatEther(binaryPool)
        };
    } catch (error) {
        console.error('Dashboard: Error fetching additional stats:', error);
        return {
            totalDirectDeposits: '0',
            binaryPool: '0'
        };
    }
}

// تابع دریافت حجم معاملات
async function getTradingVolume() {
    try {
        const { contract, provider } = await window.connectWallet();
        
        console.log('Dashboard: Getting contract balance...');
        console.log('Dashboard: Contract address:', contract.target);
        
        // دریافت موجودی POL قرارداد
        const contractMaticBalance = await provider.getBalance(contract.target);
        
        console.log('Dashboard: Raw contract balance (wei):', contractMaticBalance.toString());
        
        // تبدیل به فرمت قابل خواندن
        const formattedBalance = ethers.formatEther(contractMaticBalance);
        
        console.log('Dashboard: Contract POL balance (formatted):', formattedBalance);
        
        return formattedBalance;
    } catch (error) {
        console.error('Dashboard: Error fetching contract balance:', error);
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
    console.log('Starting connection monitoring...');
    
    // بررسی تغییرات اتصال MetaMask
    if (typeof window.ethereum !== 'undefined') {
        window.ethereum.on('accountsChanged', async (accounts) => {
            console.log('MetaMask accounts changed:', accounts);
            
            // Check cooldown to prevent frequent updates
            const now = Date.now();
            if (now - lastConnectionAttempt < CONNECTION_COOLDOWN) {
                console.log('Account change too frequent, skipping...');
                return;
            }
            lastConnectionAttempt = now;
            
            if (accounts && accounts.length > 0) {
                console.log('New account connected, initializing Web3...');
                try {
                    // ریست کردن وضعیت اتصال
                    window.resetConnectionState();
                    
                    // راه‌اندازی مجدد Web3
                    await window.initializeWeb3();
                    
                    // بارگذاری داشبورد اگر آماده است
                    if (!dashboardLoading) {
                        await loadDashboardData();
                    }
                } catch (error) {
                    console.error('Error handling account change:', error);
                }
            } else {
                console.log('All accounts disconnected, resetting dashboard...');
                resetDashboard();
            }
        });
        
        window.ethereum.on('chainChanged', async (chainId) => {
            console.log('MetaMask chain changed:', chainId);
            
            // Check cooldown to prevent frequent updates
            const now = Date.now();
            if (now - lastConnectionAttempt < CONNECTION_COOLDOWN) {
                console.log('Chain change too frequent, skipping...');
                return;
            }
            lastConnectionAttempt = now;
            
            if (chainId === '0x89') {
                console.log('Connected to Polygon, initializing Web3...');
                try {
                    // ریست کردن وضعیت اتصال
                    window.resetConnectionState();
                    
                    // راه‌اندازی مجدد Web3
                    await window.initializeWeb3();
                    
                    // بارگذاری داشبورد اگر آماده است
                    if (!dashboardLoading) {
                        await loadDashboardData();
                    }
                } catch (error) {
                    console.error('Error handling chain change:', error);
                }
            } else {
                console.log('Not on Polygon network, showing error...');
                updateConnectionStatus('error', 'لطفاً به شبکه Polygon متصل شوید');
            }
        });
        
        window.ethereum.on('connect', async (connectInfo) => {
            console.log('MetaMask connected:', connectInfo);
            
            // Check cooldown to prevent frequent updates
            const now = Date.now();
            if (now - lastConnectionAttempt < CONNECTION_COOLDOWN) {
                console.log('Connect event too frequent, skipping...');
                return;
            }
            lastConnectionAttempt = now;
            
            try {
                // ریست کردن وضعیت اتصال
                window.resetConnectionState();
                
                // راه‌اندازی مجدد Web3
                await window.initializeWeb3();
                
                // بارگذاری داشبورد اگر آماده است
                if (!dashboardLoading) {
                    await loadDashboardData();
                }
            } catch (error) {
                console.error('Error handling connection:', error);
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
            
            // Check cooldown to prevent frequent updates
            const now = Date.now();
            if (now - lastConnectionAttempt < CONNECTION_COOLDOWN) {
                console.log('WalletConnect change too frequent, skipping...');
                return;
            }
            lastConnectionAttempt = now;
            
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
        // Check cooldown period - but allow if no connection exists
        const now = Date.now();
        if (now - lastConnectionAttempt < CONNECTION_COOLDOWN && window.contractConfig && window.contractConfig.contract) {
            console.log('Connection attempt too frequent, but returning existing connection...');
            return window.contractConfig;
        }
        
        lastConnectionAttempt = now;
        console.log('Attempting smart connect...');
        
        // بررسی اتصال موجود
        if (window.contractConfig && window.contractConfig.contract && window.contractConfig.address) {
            console.log('Wallet already connected, returning existing config');
            return window.contractConfig;
        }
        
        // استفاده از تابع smartConnect از walletconnect-handler
        if (typeof smartConnect === 'function') {
            const result = await smartConnect();
            if (result) {
                console.log(`Connected with ${result}`);
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
                    console.log('MetaMask connected, initializing Web3...');
                    await window.initializeWeb3();
                    
                    // بررسی اینکه آیا contractConfig تنظیم شده است
                    if (window.contractConfig && window.contractConfig.contract) {
                        return window.contractConfig;
                    }
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

// تابع بارگذاری صفحه اصلی
async function loadHomepage() {
    try {
        console.log('Loading homepage...');
        
        // انتظار برای اتصال کیف پول
        await waitForWalletConnection();
        
        // بارگذاری داده‌های داشبورد
        await loadDashboardData();
        
        // شروع به‌روزرسانی خودکار
        startDashboardAutoUpdate();
        
        console.log('Homepage loaded successfully');
    } catch (error) {
        console.error('Error loading homepage:', error);
    }
}

// تابع اتصال خودکار کیف پول
async function autoConnectWallet() {
    try {
        console.log('Attempting auto-connect...');
        
        // بررسی اتصال موجود
        if (window.contractConfig && window.contractConfig.address) {
            console.log('Wallet already connected');
            return true;
        }
        
        // بررسی MetaMask
        if (typeof window.ethereum !== 'undefined') {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
                console.log('MetaMask already connected, initializing...');
                await window.initializeWeb3();
                return true;
            }
        }
        
        console.log('No existing connection found');
        return false;
        
    } catch (error) {
        console.error('Auto-connect failed:', error);
        return false;
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

console.log('Dashboard module loaded successfully');