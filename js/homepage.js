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
            // دریافت داده‌ها به صورت موازی - بدون fallback values
            const [prices, stats, additionalStats, tradingVolume] = await Promise.all([
                window.getPrices(),
                window.getContractStats(),
                getAdditionalStats(),
                getTradingVolume()
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
            await updateUSDCContractBalance();
        } else {
            // اگر کیف پول متصل نیست، پیام مناسب نمایش بده
            updateConnectionStatus('info', 'برای مشاهده داده‌های کامل، کیف پول خود را متصل کنید');
            
            // نمایش حالت خالی بدون مقادیر پیش‌فرض
            const emptyData = {
                prices: { cpaPriceUSD: null, cpaPriceMatic: null },
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
                priceChanges: { cpaPriceChange: null, maticPriceChange: null, volumeChange: null }
            };
            
            await updateDashboardUI(emptyData.prices, emptyData.stats, emptyData.additionalStats, emptyData.tradingVolume, emptyData.priceChanges);
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
        
        // اگر داده‌ای برای محاسبه تغییرات موجود نیست، null برگردان
        return {
            cpaPriceChange: null,
            maticPriceChange: null,
            volumeChange: null
        };
    } catch (error) {
        console.error('Dashboard: Error calculating price changes:', error);
        return {
            cpaPriceChange: null,
            maticPriceChange: null,
            volumeChange: null
        };
    }
}

// تابع به‌روزرسانی UI داشبورد
async function updateDashboardUI(prices, stats, additionalStats, tradingVolume, priceChanges) {
    const safeFormat = (val, prefix = '', suffix = '', isInteger = false, maxDecimals = 4) => {
        if (val === null || val === undefined || val === '') return 'در دسترس نیست';
        if (typeof val === 'string' && val.includes('e')) return val; // Already in scientific notation
        const num = parseFloat(val);
        if (isNaN(num)) return 'در دسترس نیست';
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
            el.textContent = formatted;
        }
    };

    const updateElementExponential = (id, value, suffix = '') => {
        const el = document.getElementById(id);
        if (el) {
            if (value === null || value === undefined) {
                el.textContent = 'در دسترس نیست';
                return;
            }
            const num = parseFloat(value);
            if (isNaN(num)) {
                el.textContent = 'در دسترس نیست';
            } else if (num === 0) {
                el.textContent = '0' + suffix;
            } else if (num < 0.000001) {
                el.textContent = num.toExponential(6) + suffix;
            } else {
                el.textContent = num.toFixed(6) + suffix;
            }
        }
    };
    
    // به‌روزرسانی قیمت‌ها با 18 رقم اعشار
    if (prices.cpaPriceUSD && prices.cpaPriceUSD !== null) {
        const element = document.getElementById('token-price');
        if (element) {
            element.textContent = prices.cpaPriceUSD;
        }
    } else {
        updateElement('token-price', null, '', '', false, 6);
    }
    // نمایش قیمت توکن به POL با نماد علمی
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
            // pointValue از قرارداد
            let pointValue = await contract.getPointValue();
            updateElement('point-value', parseFloat(ethers.formatUnits(pointValue, 18)), '', ' CPA', false, 2);
        } else {
            // اگر قرارداد در دسترس نیست، از stats استفاده کن
            updateElement('total-points', parseInt(stats.totalClaimableBinaryPoints.replace(/\..*$/, '')), '', ' POINT', true);
            updateElement('point-value', stats.pointValue, '', ' CPA', false, 2);
        }
    } catch (e) {
        // اگر خطا بود، null نمایش بده
        updateElement('total-points', null, '', ' POINT', true);
        updateElement('point-value', null, '', ' CPA', false, 2);
    }
    
    // پوینت‌های ادعا شده = 0 (چون هنوز ادعا نشدن)
    updateElement('claimed-points', 0, '', '', true);
    
    // پوینت‌های باقیمانده = کل پوینت‌ها
    updateElement('remaining-points', parseInt(stats.totalClaimableBinaryPoints.replace(/\..*$/, '')), '', '', true);
    
    // موجودی قرارداد با نهایتاً ۶ رقم اعشار
    const tradingVolumeNum = Number(tradingVolume);
    updateElement('trading-volume', isNaN(tradingVolumeNum) ? null : tradingVolumeNum, '', ' POL', false, 6);
    
    // contract token balance
    let contractTokenBalanceCPA = parseFloat(stats.contractTokenBalance);
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

// Add after DOMContentLoaded or main dashboard load logic:
async function updateUSDCContractBalance() {
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
    const usdcBalance = await contract.getContractUSDCBalance();
    const usdcFormatted = (Number(usdcBalance) / 1e6).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    const el = document.getElementById('dashboard-usdc-balance');
    if (el) el.textContent = usdcFormatted + ' USDC';
  } catch (e) {
    const el = document.getElementById('dashboard-usdc-balance');
    if (el) el.textContent = '-';
  }
}
document.addEventListener('DOMContentLoaded', updateUSDCContractBalance);

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

