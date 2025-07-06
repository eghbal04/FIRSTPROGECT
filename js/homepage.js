// homepage.js
// سایر کدهای مربوط به داشبورد و آمار و ... (کدهای expand/collapse و marquee حذف شدند)
// ...

// homepage.js - بارگذاری داده‌های داشبورد و آمار پلتفرم
let dashboardLoading = false;
let dashboardInitialized = false;
let lastDashboardUpdate = 0;
let dashboardUpdateInterval = null;
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
        // به‌روزرسانی نمایش دکمه‌های کیف پول
        if (window.WalletConnectHandler) {
            window.WalletConnectHandler.updateWalletButtonVisibility();
        }
        
        // شروع نظارت بر تغییرات اتصال
        startConnectionMonitoring();
        
        // منتظر اتصال کیف پول بمان
        const walletConnected = await waitForWalletConnection();
        
        if (walletConnected.connected) {
            // بارگذاری داده‌های داشبورد
            await loadDashboardData();
            dashboardInitialized = true;

            // به‌روزرسانی خودکار هر 30 ثانیه
            startDashboardAutoUpdate();
        } else {
            // شروع نظارت بر اتصال
            startConnectionMonitoring();
        }

    } catch (error) {
        // console.error("Error in homepage:", error);
    }
});

// تابع شروع به‌روزرسانی خودکار داشبورد
function startDashboardAutoUpdate() {
    if (dashboardUpdateInterval) {
        clearInterval(dashboardUpdateInterval);
    }
    
    dashboardUpdateInterval = setInterval(async () => {
        try {
            // بررسی اینکه صفحه فعال است
            if (document.hidden) {
                return; // اگر صفحه مخفی است، به‌روزرسانی نکن
            }
            await loadDashboardData();
        } catch (error) {
            // console.error('Dashboard auto-update error:', error);
        }
    }, 60000); // هر 1 دقیقه (کاهش فرکانس)
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
    const maxAttempts = 10; // کاهش به 10 ثانیه
    
    while (attempts < maxAttempts) {
        try {
            // بررسی اینکه آیا تابع checkConnection موجود است
            if (typeof window.checkConnection === 'function') {
                const result = await window.checkConnection();
                if (result && result.connected) {
                    return result;
                }
            } else {
                // اگر تابع checkConnection موجود نیست، منتظر بمانیم
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } catch (error) {
            console.warn('Wallet connection attempt failed:', error);
            // خطا را نادیده بگیر و ادامه بده
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
    }
    
    // به جای throw کردن خطا، false برگردان
    console.warn('Dashboard: Timeout waiting for wallet connection - continuing without wallet');
    return { connected: false, error: 'Timeout waiting for wallet connection' };
}

// تابع بارگذاری داده‌های داشبورد
async function loadDashboardData() {
    if (isDashboardLoading) {
        return;
    }
    
    isDashboardLoading = true;
    
    try {
        // بررسی اتصال کیف پول
        const walletConnected = await waitForWalletConnection();
        
        if (walletConnected.connected) {
            // دریافت داده‌ها به صورت موازی
            const [prices, stats, additionalStats, tradingVolume] = await Promise.all([
                window.getPrices().catch(() => ({ cpaPriceUSD: 0, cpaPriceMatic: 0 })),
                window.getContractStats().catch(() => ({
                    totalSupply: "0",
                    circulatingSupply: "0",
                    binaryPool: "0",
                    totalPoints: "0",
                    totalClaimableBinaryPoints: "0",
                    pointValue: "0",
                    rewardPool: "0",
                    contractTokenBalance: "0"
                })),
                getAdditionalStats().catch(() => ({ wallets: 0, helpFund: 0 })),
                getTradingVolume().catch(() => 0)
            ]);
            
            // محاسبه تغییرات قیمت
            const priceChanges = await calculatePriceChanges();
            
            // بارگذاری آمار شبکه
            try {
                await window.autoLoadNetworkStats();
            } catch (error) {
                console.warn('Failed to load network stats:', error);
            }
            
            // به‌روزرسانی UI
            await updateDashboardUI(prices, stats, additionalStats, tradingVolume, priceChanges);
        } else {
            // اگر کیف پول متصل نیست، فقط قیمت‌ها را بارگذاری کن
            try {
                // بررسی اینکه آیا تابع getPrices موجود است
                if (typeof window.getPrices === 'function') {
                    const prices = await window.getPrices().catch(() => ({ cpaPriceUSD: 0, cpaPriceMatic: 0 }));
                    const defaultStats = {
                        totalSupply: "0",
                        circulatingSupply: "0",
                        binaryPool: "0",
                        totalPoints: "0",
                        totalClaimableBinaryPoints: "0",
                        pointValue: "0",
                        rewardPool: "0",
                        contractTokenBalance: "0"
                    };
                    const defaultAdditionalStats = { wallets: 0, helpFund: 0 };
                    const defaultTradingVolume = 0;
                    const priceChanges = { cpaPriceChange: '0%', maticPriceChange: '0%', volumeChange: '0%' };
                    
                    await updateDashboardUI(prices, defaultStats, defaultAdditionalStats, defaultTradingVolume, priceChanges);
                    updateConnectionStatus('info', 'برای مشاهده داده‌های کامل، کیف پول خود را متصل کنید');
                } else {
                    // اگر تابع getPrices موجود نیست، داده‌های پیش‌فرض نمایش بده
                    const defaultPrices = { cpaPriceUSD: 0, cpaPriceMatic: 0 };
                    const defaultStats = {
                        totalSupply: "0",
                        circulatingSupply: "0",
                        binaryPool: "0",
                        totalPoints: "0",
                        totalClaimableBinaryPoints: "0",
                        pointValue: "0",
                        rewardPool: "0",
                        contractTokenBalance: "0"
                    };
                    const defaultAdditionalStats = { wallets: 0, helpFund: 0 };
                    const defaultTradingVolume = 0;
                    const priceChanges = { cpaPriceChange: '0%', maticPriceChange: '0%', volumeChange: '0%' };
                    
                    await updateDashboardUI(defaultPrices, defaultStats, defaultAdditionalStats, defaultTradingVolume, priceChanges);
                    updateConnectionStatus('info', 'برای مشاهده داده‌های کامل، کیف پول خود را متصل کنید');
                }
            } catch (error) {
                console.warn('Dashboard: Error loading prices without wallet:', error);
            }
        }
        
    } catch (error) {
        console.warn('Dashboard: Error loading data:', error);
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
            cpaPriceChange: '0%',
            maticPriceChange: '0%',
            volumeChange: '0%'
        };
    } catch (error) {
        // console.error('Dashboard: Error calculating price changes:', error);
        return {
            cpaPriceChange: '0%',
            maticPriceChange: '0%',
            volumeChange: '0%'
        };
    }
}

// تابع به‌روزرسانی UI داشبورد
async function updateDashboardUI(prices, stats, additionalStats, tradingVolume, priceChanges) {
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
    updateElement('token-price', prices.cpaPriceUSD, '$', '', false, 6);
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
    updateElementExponential('token-price-matic', prices.cpaPriceMatic, ' POL');
    
    // مقداردهی توکن‌های در گردش و کل پوینت‌ها مستقیماً از توابع قرارداد
    try {
        if (window.contractConfig && window.contractConfig.contract) {
            const { contract } = await window.connectWallet();
            // contractTotalSupply
            let supply = await contract.contractTotalSupply();
            updateElement('circulating-supply', parseInt(ethers.formatUnits(supply, 18)), '', ' CPA', true);
            // totalClaimablePoints
            let points = await contract.totalClaimablePoints();
            updateElement('total-points', parseInt(ethers.formatUnits(points, 0)), '', ' POINT', true);
        } else {
            // اگر قرارداد در دسترس نیست، از stats استفاده کن
            updateElement('total-points', parseInt(stats.totalClaimableBinaryPoints.replace(/\..*$/, '')), '', ' POINT', true);
        }
    } catch (e) {
        // اگر خطا بود، از stats قبلی استفاده کن
        updateElement('total-points', parseInt(stats.totalClaimableBinaryPoints.replace(/\..*$/, '')), '', ' POINT', true);
    }
    
    // پوینت‌های ادعا شده = 0 (چون هنوز ادعا نشدن)
    updateElement('claimed-points', 0, '', '', true);
    
    // پوینت‌های باقیمانده = کل پوینت‌ها
    updateElement('remaining-points', parseInt(stats.totalClaimableBinaryPoints.replace(/\..*$/, '')), '', '', true);
    
    // موجودی قرارداد با نهایتاً ۶ رقم اعشار
    const tradingVolumeNum = Number(tradingVolume);
    updateElement('trading-volume', isNaN(tradingVolumeNum) ? 0 : tradingVolumeNum, '', ' POL', false, 6);
    
    // ارزش پوینت = pointValue (به صورت CPA)
    let pointValueCPA = parseFloat(stats.pointValue);
    let contractTokenBalanceCPA = parseFloat(stats.contractTokenBalance);
    
    updateElement('point-value', pointValueCPA, '', ' CPA', false, 6);
    updateElement('contract-token-balance', contractTokenBalanceCPA, '', ' CPA', false, 4);
    let rewardPoolPOL = parseFloat(stats.rewardPool);
    updateElement('reward-pool', rewardPoolPOL, '', ' POL', false, 4);
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
        // console.error('Dashboard: Error checking wallet status:', error);
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
        
    } catch (error) {
        // console.error('Dashboard: Error disconnecting wallet:', error);
        updateConnectionStatus('error', 'خطا در قطع اتصال کیف پول');
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
            totalClaimableBinaryPoints = await contract.totalClaimableBinaryPoints;
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
                    
                    // بارگذاری داشبورد اگر آماده است
                    if (!dashboardLoading) {
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
                    
                    // بارگذاری داشبورد اگر آماده است
                    if (!dashboardLoading) {
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
        // console.error('Error handling WalletConnect success:', error);
        updateConnectionStatus('error', 'خطا در تنظیم اتصال: ' + error.message);
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
        updateConnectionStatus('info', 'در حال اتصال با WalletConnect...');
        
        // فراخوانی تابع اتصال از WalletConnectHandler
        const provider = await window.WalletConnectHandler.connectWithWalletConnect();
        
        if (provider && provider.connected) {
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
        // console.error('WalletConnect QR connection error:', error);
        
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
        
        // شروع به‌روزرسانی خودکار
        startDashboardAutoUpdate();
        
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
        // فراخوانی loadHomepage
        loadHomepage();
    }, 500);
});

// تابع تست totalClaimablePoints
window.testTotalClaimablePoints = async function() {
    try {
        const { contract } = await window.connectWallet();
        const points = await contract.totalClaimablePoints();
        console.log('totalClaimablePoints:', ethers.formatUnits(points, 18));
    } catch (e) {
        console.error('Error calling totalClaimablePoints:', e);
    }
};

// تابع تست contractTotalSupply
window.testContractTotalSupply = async function() {
    try {
        const { contract } = await window.connectWallet();
        const supply = await contract.contractTotalSupply();
        console.log('contractTotalSupply:', ethers.formatUnits(supply, 18));
    } catch (e) {
        console.error('Error calling contractTotalSupply:', e);
    }
};