// homepage.js
// سایر کدهای مربوط به داشبورد و آمار و ... (کدهای expand/collapse و marquee حذف شدند)
// ...

// homepage.js - بارگذاری داده‌های داشبورد و آمار پلتفرم
let isDashboardLoading = false;
let dashboardInitialized = false;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log("Homepage loaded, waiting for wallet connection...");
        
        // منتظر اتصال کیف پول بمان
        await waitForWalletConnection();
        
        // بارگذاری داده‌های داشبورد
        await loadDashboardData();
        dashboardInitialized = true;

        // به‌روزرسانی خودکار هر 30 ثانیه
        setInterval(async () => {
            if (!isDashboardLoading && dashboardInitialized) {
                await loadDashboardData();
            }
        }, 30000);

    } catch (error) {
        console.error("Error in homepage:", error);
    }
});

// تابع انتظار برای اتصال کیف پول
async function waitForWalletConnection() {
    let attempts = 0;
    const maxAttempts = 100; // حداکثر 10 ثانیه
    
    while (attempts < maxAttempts) {
        try {
            const connection = await checkConnection();
            if (connection.connected) {
                console.log("Wallet connected, proceeding with dashboard load");
                return true;
            }
            
            console.log(`Waiting for wallet connection... (attempt ${attempts + 1}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
            
        } catch (error) {
            console.log("Connection check failed, retrying...");
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
    }
    
    throw new Error("Wallet connection timeout");
}

// تابع بارگذاری داده‌های داشبورد
async function loadDashboardData() {
    if (isDashboardLoading) {
        console.log("Dashboard data is already loading, skipping...");
        return;
    }
    
    isDashboardLoading = true;
    console.log("Loading dashboard data...");
    
    try {
        // بررسی اتصال کیف پول
        const connection = await checkConnection();
        if (!connection.connected) {
            console.log("Wallet not connected, skipping dashboard update");
            return;
        }

        console.log("Fetching prices...");
        const prices = await getPrices();
        console.log("Prices fetched:", prices);
        
        console.log("Fetching contract stats...");
        const stats = await getContractStats();
        console.log("Contract stats fetched:", stats);
        
        console.log("Fetching additional stats...");
        const additionalStats = await getAdditionalStats();
        console.log("Additional stats fetched:", additionalStats);
        
        console.log("Fetching trading volume...");
        const tradingVolume = await getTradingVolume();
        console.log("Trading volume fetched:", tradingVolume);

        console.log("Calculating price changes...");
        const priceChanges = await calculatePriceChanges();
        console.log("Price changes calculated:", priceChanges);

        console.log("Updating dashboard UI...");
        updateDashboardUI(prices, stats, additionalStats, tradingVolume, priceChanges);
        console.log("Dashboard UI updated successfully");

    } catch (error) {
        console.error("Error loading dashboard data:", error);
        
        // نمایش خطا در UI
        const errorMessage = `خطا در بارگذاری داده‌ها: ${error.message}`;
        console.error(errorMessage);
        
        // اگر خطای اتصال بود، بعد از 5 ثانیه دوباره تلاش کن
        if (error.message.includes('Failed to connect') || error.message.includes('Wallet not connected')) {
            console.log("Connection error, will retry in 5 seconds...");
            setTimeout(() => {
                isDashboardLoading = false;
                loadDashboardData();
            }, 5000);
            return;
        }
    } finally {
        isDashboardLoading = false;
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
    const updateElement = (id, value, prefix = '', suffix = '') => {
        const element = document.getElementById(id);
        if (!element) return;
        
        // فرمت‌دهی اعداد بزرگ
        if (typeof value === 'string' && value.includes('.')) {
            const num = parseFloat(value);
            if (!isNaN(num)) {
                if (num >= 1000000) {
                    value = (num / 1000000).toFixed(2) + 'M';
                } else if (num >= 1000) {
                    value = (num / 1000).toFixed(2) + 'K';
                } else {
                    value = num.toLocaleString('en-US', { maximumFractionDigits: 6 });
                }
            }
        }
        
        element.textContent = prefix + value + suffix;
    };

    // به‌روزرسانی قیمت USD با درصد تغییر
    const usdElement = document.getElementById('token-price');
    if (usdElement) {
        const usdValue = parseFloat(prices.tokenPriceUSD).toFixed(6);
        const usdChangeIcon = priceChanges.usdChangePercent >= 0 ? '📈' : '📉';
        const usdChangeColor = priceChanges.usdChangePercent >= 0 ? '#00ff88' : '#ff4444';
        const usdChangeText = priceChanges.usdChangePercent >= 0 ? '+' : '';
        
        usdElement.innerHTML = `
            <div style="font-size: 1.2rem; font-weight: bold;">$${usdValue} USD</div>
            <div style="font-size: 0.8rem; color: ${usdChangeColor}; margin-top: 0.2rem;">
                ${usdChangeIcon} ${usdChangeText}${priceChanges.usdChangePercent.toFixed(2)}%
            </div>
        `;
    }
    
    // به‌روزرسانی قیمت MATIC با درصد تغییر
    const maticElement = document.getElementById('token-price-matic');
    if (maticElement) {
        const maticValue = parseFloat(prices.tokenPrice).toFixed(6);
        const maticChangeIcon = priceChanges.maticChangePercent >= 0 ? '📈' : '📉';
        const maticChangeColor = priceChanges.maticChangePercent >= 0 ? '#00ff88' : '#ff4444';
        const maticChangeText = priceChanges.maticChangePercent >= 0 ? '+' : '';
        
        maticElement.innerHTML = `
            <div style="font-size: 1.2rem; font-weight: bold;">${maticValue} MATIC</div>
            <div style="font-size: 0.8rem; color: ${maticChangeColor}; margin-top: 0.2rem;">
                ${maticChangeIcon} ${maticChangeText}${priceChanges.maticChangePercent.toFixed(2)}%
            </div>
        `;
    }
    
    // به‌روزرسانی توکن‌های در گردش (تبدیل به دلار)
    const circulatingSupplyElement = document.getElementById('circulating-supply');
    if (circulatingSupplyElement) {
        const circulatingSupplyNum = parseFloat(stats.circulatingSupply);
        const circulatingSupplyUSD = (circulatingSupplyNum * parseFloat(prices.tokenPriceUSD)).toFixed(2);
        circulatingSupplyElement.innerHTML = `
            <div style="font-size: 1.2rem; font-weight: bold;">${circulatingSupplyNum.toLocaleString('en-US', {maximumFractionDigits: 2})} LVL</div>
            <div style="font-size: 0.8rem; color: #00ccff; margin-top: 0.2rem;">~$${circulatingSupplyUSD} USD</div>
        `;
    }
    
    // به‌روزرسانی تعداد کاربران
    updateElement('total-points', stats.totalUsers);
    
    // به‌روزرسانی پوینت‌های پرداخت شده
    updateElement('claimed-points', additionalStats.claimedPoints);
    
    // به‌روزرسانی حجم معاملات (تبدیل به دلار)
    const tradingVolumeElement = document.getElementById('trading-volume');
    if (tradingVolumeElement) {
        const tradingVolumeNum = parseFloat(tradingVolume.contractBalance);
        const maticPriceUSD = parseFloat(prices.maticPrice);
        const tradingVolumeUSD = (tradingVolumeNum * maticPriceUSD).toFixed(2);
        tradingVolumeElement.innerHTML = `
            <div style="font-size: 1.2rem; font-weight: bold;">${tradingVolumeNum.toLocaleString('en-US', {maximumFractionDigits: 2})} MATIC</div>
            <div style="font-size: 0.8rem; color: #00ccff; margin-top: 0.2rem;">~$${tradingVolumeUSD} USD</div>
        `;
    }
    
    // به‌روزرسانی ارزش پوینت (تبدیل به دلار)
    const pointValueElement = document.getElementById('point-value');
    if (pointValueElement) {
        const pointValueNum = parseFloat(additionalStats.pointValue);
        const pointValueUSD = (pointValueNum * parseFloat(prices.tokenPriceUSD)).toFixed(6);
        pointValueElement.innerHTML = `
            <div style="font-size: 1.2rem; font-weight: bold;">${pointValueNum.toLocaleString('en-US', {maximumFractionDigits: 6})} LVL</div>
            <div style="font-size: 0.8rem; color: #00ccff; margin-top: 0.2rem;">~$${pointValueUSD} USD</div>
        `;
    }
    
    // به‌روزرسانی استخر پاداش (تبدیل به دلار)
    const rewardPoolElement = document.getElementById('reward-pool');
    if (rewardPoolElement) {
        const rewardPoolNum = parseFloat(stats.rewardPool);
        const rewardPoolUSD = (rewardPoolNum * parseFloat(prices.tokenPriceUSD)).toFixed(2);
        rewardPoolElement.innerHTML = `
            <div style="font-size: 1.2rem; font-weight: bold;">${rewardPoolNum.toLocaleString('en-US', {maximumFractionDigits: 2})} LVL</div>
            <div style="font-size: 0.8rem; color: #00ccff; margin-top: 0.2rem;">~$${rewardPoolUSD} USD</div>
        `;
    }
    
    // به‌روزرسانی پوینت‌های باقی‌مانده
    updateElement('remaining-points', additionalStats.remainingPoints);
}

// تابع بررسی اتصال کیف پول
async function checkConnection() {
    try {
        // بررسی اینکه آیا contractConfig موجود است
        if (!window.contractConfig) {
            return {
                connected: false,
                error: "Contract config not initialized"
            };
        }
        
        // بررسی اینکه آیا signer موجود است
        if (!window.contractConfig.signer) {
            return {
                connected: false,
                error: "No signer available"
            };
        }
        
        // بررسی اینکه آیا در حال اتصال هستیم
        if (window.contractConfig.isConnecting) {
            return {
                connected: false,
                error: "Connection in progress"
            };
        }
        
        const address = await window.contractConfig.signer.getAddress();
        if (!address) {
            return {
                connected: false,
                error: "No wallet address"
            };
        }
        
        const provider = window.contractConfig.provider;
        if (!provider) {
            return {
                connected: false,
                error: "No provider available"
            };
        }
        
        const network = await provider.getNetwork();
        
        return {
            connected: true,
            address,
            network: network.name,
            chainId: network.chainId
        };
    } catch (error) {
        console.error("Error checking connection:", error);
        return {
            connected: false,
            error: error.message
        };
    }
}

// تابع اتصال به کیف پول
async function connectWallet() {
    if (!window.contractConfig) {
        throw new Error("Contract config not initialized");
    }
    
    // بررسی اینکه آیا قبلاً متصل هستیم
    if (window.contractConfig.signer && window.contractConfig.contract) {
        try {
            const address = await window.contractConfig.signer.getAddress();
            if (address) {
                return {
                    provider: window.contractConfig.provider,
                    contract: window.contractConfig.contract,
                    signer: window.contractConfig.signer,
                    address: address
                };
            }
        } catch (error) {
            // اگر signer معتبر نیست، دوباره اتصال برقرار کنیم
            console.log("Existing connection invalid, reconnecting...");
        }
    }
    
    // اگر در حال اتصال هستیم، منتظر بمان
    if (window.contractConfig.isConnecting) {
        console.log("Wallet connection in progress, waiting...");
        let waitCount = 0;
        const maxWaitTime = 50; // حداکثر 5 ثانیه
        
        while (window.contractConfig.isConnecting && waitCount < maxWaitTime) {
            await new Promise(resolve => setTimeout(resolve, 100));
            waitCount++;
            
            // اگر اتصال موفق شد، از حلقه خارج شو
            if (window.contractConfig.signer && window.contractConfig.contract) {
                try {
                    const address = await window.contractConfig.signer.getAddress();
                    if (address) {
                        console.log("Connection completed while waiting");
                        return {
                            provider: window.contractConfig.provider,
                            contract: window.contractConfig.contract,
                            signer: window.contractConfig.signer,
                            address: address
                        };
                    }
                } catch (error) {
                    // ادامه انتظار
                }
            }
        }
        
        // اگر زمان انتظار تمام شد، isConnecting را ریست کن
        if (window.contractConfig.isConnecting) {
            console.log("Connection timeout, resetting isConnecting flag");
            window.contractConfig.isConnecting = false;
        }
    }
    
    // تلاش برای اتصال
    const success = await window.contractConfig.initializeWeb3();
    if (!success) {
        throw new Error("Failed to connect to wallet");
    }
    
    // بررسی اینکه آیا اتصال موفق بود
    if (!window.contractConfig.signer) {
        throw new Error("Failed to connect to wallet");
    }
    
    return {
        provider: window.contractConfig.provider,
        contract: window.contractConfig.contract,
        signer: window.contractConfig.signer,
        address: await window.contractConfig.signer.getAddress()
    };
}

// تابع اتصال با QR Code
async function connectWithQRCode() {
    try {
        console.log('Starting QR code connection...');
        
        // بررسی بارگذاری WalletConnect
        if (typeof window.WalletConnectEthereumProvider === 'undefined') {
            console.error('WalletConnect UMD not loaded, attempting to load...');
            
            // تلاش برای بارگذاری WalletConnect
            await loadWalletConnect();
            
            // انتظار برای بارگذاری WalletConnect
            let attempts = 0;
            const maxAttempts = 15;
            
            while (typeof window.WalletConnectEthereumProvider === 'undefined' && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                attempts++;
                console.log(`Waiting for WalletConnect... (attempt ${attempts}/${maxAttempts})`);
            }
            
            if (typeof window.WalletConnectEthereumProvider === 'undefined') {
                throw new Error('WalletConnect failed to load. Please refresh the page and try again, or use the "اتصال هوشمند" button instead.');
            }
        }
        
        console.log('WalletConnect UMD loaded, initializing...');
        
        // بررسی وجود contractConfig
        if (!window.contractConfig) {
            throw new Error('Contract configuration not initialized. Please refresh the page.');
        }
        
        // راه‌اندازی WalletConnect
        await window.contractConfig.initializeWalletConnect();
        
        // نمایش QR Code
        if (window.contractConfig.walletConnectProvider && window.contractConfig.walletConnectProvider.uri) {
            window.contractConfig.generateQRCode(window.contractConfig.walletConnectProvider.uri);
        } else {
            throw new Error('QR Code URI not generated. Please try again.');
        }
        
    } catch (error) {
        console.error('خطا در اتصال با QR Code:', error);
        
        // نمایش پیام خطا به کاربر
        const errorMessage = error.message || 'خطا در اتصال با QR Code';
        
        // اگر WalletConnect بارگذاری نشده، پیشنهاد استفاده از اتصال هوشمند
        if (error.message.includes('WalletConnect failed to load') || error.message.includes('WalletConnect UMD not loaded')) {
            alert(`خطا در بارگذاری WalletConnect:\n${errorMessage}\n\n💡 پیشنهاد: از دکمه "اتصال هوشمند" استفاده کنید که با MetaMask کار می‌کند.`);
        } else {
            alert(`خطا در اتصال با بارکد:\n${errorMessage}\n\nلطفاً صفحه را رفرش کنید و دوباره تلاش کنید.`);
        }
    }
}

// تابع بارگذاری WalletConnect
async function loadWalletConnect() {
    return new Promise((resolve, reject) => {
        const sources = [
            'https://cdn.jsdelivr.net/npm/@walletconnect/ethereum-provider@2.11.4/dist/umd/index.min.js',
            'https://unpkg.com/@walletconnect/ethereum-provider@2.11.4/dist/umd/index.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/walletconnect/2.11.4/umd/index.min.js'
        ];
        
        let currentSource = 0;
        
        function tryNextSource() {
            if (currentSource >= sources.length) {
                reject(new Error('All WalletConnect sources failed to load'));
                return;
            }
            
            console.log(`Trying WalletConnect source ${currentSource + 1}: ${sources[currentSource]}`);
            
            const script = document.createElement('script');
            script.src = sources[currentSource];
            script.onload = () => {
                console.log(`WalletConnect loaded successfully from source ${currentSource + 1}`);
                resolve();
            };
            script.onerror = () => {
                console.error(`WalletConnect failed to load from source ${currentSource + 1}`);
                currentSource++;
                tryNextSource();
            };
            document.head.appendChild(script);
        }
        
        tryNextSource();
    });
}

// تابع اتصال هوشمند (انتخاب بهترین روش)
async function smartConnect() {
    if (!window.contractConfig) {
        throw new Error("Contract config not initialized");
    }
    
    try {
        // بررسی کیف پول‌های موجود
        const availableWallets = window.contractConfig.detectAvailableWallets();
        
        // اگر MetaMask موجود است، از آن استفاده کن
        if (availableWallets.metamask) {
            console.log("MetaMask detected, using MetaMask connection...");
            return await connectWallet();
        } 
        // در غیر این صورت از QR Code استفاده کن
        else if (availableWallets.walletconnect) {
            console.log("No MetaMask detected, using QR code connection...");
            return await connectWithQRCode();
        } 
        else {
            throw new Error("هیچ کیف پولی یافت نشد");
        }
        
    } catch (error) {
        console.error("Smart connect error:", error);
        throw error;
    }
}

// تابع دریافت قیمت‌ها
async function getPrices() {
    try {
        console.log("Connecting to wallet for price data...");
        const { contract } = await smartConnect();
        console.log("Wallet connected, fetching prices from contract...");
        
        // تلاش برای دریافت قیمت‌ها با مدیریت خطا
        let tokenPrice = "0.0012";
        let maticPrice = "1.00";
        let registrationPrice = "10.0";
        let tokenPriceUSD = "0.0012";
        
        try {
            console.log("Fetching token price...");
            const tokenPriceRaw = await contract.updateTokenPrice();
            tokenPrice = ethers.formatUnits(tokenPriceRaw, 18);
            console.log("Token price fetched:", tokenPrice);
        } catch (error) {
            console.warn("Failed to fetch token price, using default:", error.message);
        }
        
        try {
            console.log("Fetching MATIC price...");
            const maticPriceRaw = await contract.getLatestMaticPrice();
            maticPrice = ethers.formatUnits(maticPriceRaw, 8);
            console.log("MATIC price fetched:", maticPrice);
        } catch (error) {
            console.warn("Failed to fetch MATIC price, using default:", error.message);
        }
        
        try {
            console.log("Fetching registration price...");
            const registrationPriceRaw = await contract.getRegistrationPrice();
            registrationPrice = ethers.formatEther(registrationPriceRaw);
            console.log("Registration price fetched:", registrationPrice);
        } catch (error) {
            console.warn("Failed to fetch registration price, using default:", error.message);
        }
        
        try {
            console.log("Fetching token price in USD...");
            const tokenPriceUSDRaw = await contract.getTokenPriceInUSD();
            tokenPriceUSD = ethers.formatUnits(tokenPriceUSDRaw, 8);
            console.log("Token price in USD fetched:", tokenPriceUSD);
        } catch (error) {
            console.warn("Failed to fetch token price in USD, using default:", error.message);
        }
        
        const result = {
            tokenPrice,
            maticPrice,
            registrationPrice,
            tokenPriceUSD
        };
        
        console.log("All prices fetched successfully:", result);
        return result;
        
    } catch (error) {
        console.error("Error fetching prices:", error);
        // بازگشت مقادیر پیش‌فرض در صورت خطا
        return {
            tokenPrice: "0.0012",
            maticPrice: "1.00",
            registrationPrice: "10.0",
            tokenPriceUSD: "0.0012"
        };
    }
}

// تابع دریافت آمار کلی قرارداد
async function getContractStats() {
    try {
        console.log("Connecting to wallet for contract stats...");
        const { contract } = await smartConnect();
        console.log("Wallet connected, fetching contract stats...");
        
        // تلاش برای دریافت آمار با مدیریت خطا
        let totalUsers = "0";
        let totalSupply = "0";
        let binaryPool = "0";
        let rewardPool = "0";
        let totalPoints = "0";
        let totalDirectDeposits = "0";
        let circulatingSupply = "0";
        
        try {
            console.log("Fetching total users...");
            const totalUsersRaw = await contract.totalUsers();
            totalUsers = totalUsersRaw.toString();
            console.log("Total users fetched:", totalUsers);
        } catch (error) {
            console.warn("Failed to fetch total users, using default:", error.message);
        }
        
        try {
            console.log("Fetching total supply...");
            const totalSupplyRaw = await contract.totalSupply();
            totalSupply = ethers.formatUnits(totalSupplyRaw, 18);
            console.log("Total supply fetched:", totalSupply);
        } catch (error) {
            console.warn("Failed to fetch total supply, using default:", error.message);
        }
        
        try {
            console.log("Fetching binary pool...");
            const binaryPoolRaw = await contract.binaryPool();
            binaryPool = ethers.formatEther(binaryPoolRaw);
            console.log("Binary pool fetched:", binaryPool);
        } catch (error) {
            console.warn("Failed to fetch binary pool, using default:", error.message);
        }
        
        try {
            console.log("Fetching reward pool...");
            const rewardPoolRaw = await contract.rewardPool();
            rewardPool = ethers.formatEther(rewardPoolRaw);
            console.log("Reward pool fetched:", rewardPool);
        } catch (error) {
            console.warn("Failed to fetch reward pool, using default:", error.message);
        }
        
        try {
            console.log("Fetching total points...");
            const totalPointsRaw = await contract.totalPoints();
            totalPoints = totalPointsRaw.toString();
            console.log("Total points fetched:", totalPoints);
        } catch (error) {
            console.warn("Failed to fetch total points, using default:", error.message);
        }
        
        try {
            console.log("Fetching total direct deposits...");
            const totalDirectDepositsRaw = await contract.totalDirectDeposits();
            totalDirectDeposits = ethers.formatEther(totalDirectDepositsRaw);
            console.log("Total direct deposits fetched:", totalDirectDeposits);
        } catch (error) {
            console.warn("Failed to fetch total direct deposits, using default:", error.message);
        }
        
        try {
            console.log("Fetching circulating supply...");
            const circulatingSupplyRaw = await contract.circulatingSupply();
            circulatingSupply = ethers.formatEther(circulatingSupplyRaw);
            console.log("Circulating supply fetched:", circulatingSupply);
        } catch (error) {
            console.warn("Failed to fetch circulating supply, using default:", error.message);
        }
        
        const result = {
            totalUsers,
            totalSupply,
            binaryPool,
            rewardPool,
            totalPoints,
            totalDirectDeposits,
            circulatingSupply
        };
        
        console.log("All contract stats fetched successfully:", result);
        return result;
        
    } catch (error) {
        console.error("Error fetching contract stats:", error);
        // بازگشت مقادیر پیش‌فرض در صورت خطا
        return {
            totalUsers: "0",
            totalSupply: "0",
            binaryPool: "0",
            rewardPool: "0",
            totalPoints: "0",
            totalDirectDeposits: "0",
            circulatingSupply: "0"
        };
    }
}

// تابع محاسبه اطلاعات اضافی
async function getAdditionalStats() {
    try {
        const { contract } = await smartConnect();
        
        let pointValue = "0";
        let claimedPoints = "0";
        let remainingPoints = "0";
        
        // دریافت ارزش هر پوینت (به توکن LVL)
        try {
            const pointValueRaw = await contract.getPointValue();
            pointValue = ethers.formatUnits(pointValueRaw, 18);
        } catch (error) {
            // getPointValue failed
        }
        
        // محاسبه پوینت‌های پرداخت شده و مانده
        try {
            const totalClaimableBinaryPoints = await contract.totalClaimableBinaryPoints();
            const totalPoints = await contract.totalPoints();
            
            claimedPoints = ethers.formatUnits(totalClaimableBinaryPoints, 18);
            const remainingRaw = totalPoints - totalClaimableBinaryPoints;
            const safeRemainingRaw = remainingRaw > 0 ? remainingRaw : 0n;
            remainingPoints = ethers.formatUnits(safeRemainingRaw, 18);
            
        } catch (error) {
            // Error calculating points
        }
        
        return {
            pointValue,
            claimedPoints,
            remainingPoints
        };
    } catch (error) {
        console.error("Error in getAdditionalStats:", error);
        return {
            pointValue: "0",
            claimedPoints: "0",
            remainingPoints: "0"
        };
    }
}

// تابع محاسبه حجم معاملات
async function getTradingVolume() {
    try {
        const { contract } = await smartConnect();
        
        let contractBalance = "0";
        let totalVolume = "0";
        
        // دریافت موجودی قرارداد (این همان حجم معاملات است)
        try {
            const balanceRaw = await contract.getContractMaticBalance();
            contractBalance = ethers.formatEther(balanceRaw);
            totalVolume = contractBalance; // حجم معاملات = موجودی فعلی قرارداد
        } catch (balanceError) {
            console.error("Error getting contract balance:", balanceError);
        }
        
        return {
            contractBalance,
            totalVolume
        };
    } catch (error) {
        console.error("Error in getTradingVolume:", error);
        return {
            contractBalance: "0",
            totalVolume: "0"
        };
    }
}