// homepage.js
// سایر کدهای مربوط به داشبورد و آمار و ... (کدهای expand/collapse و marquee حذف شدند)
// ...

// homepage.js - بارگذاری داده‌های داشبورد و آمار پلتفرم
let isDashboardLoading = false;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // بررسی اتصال کیف پول
        const connection = await checkConnection();
        if (!connection.connected) {
            // اگر کیف پول متصل نیست، منتظر اتصال بمان
            console.log("Wallet not connected, waiting for connection...");
            return;
        }

        // بارگذاری داده‌های داشبورد
        await loadDashboardData();

        // به‌روزرسانی خودکار هر 30 ثانیه
        setInterval(async () => {
            if (!isDashboardLoading) {
                await loadDashboardData();
            }
        }, 30000);

    } catch (error) {
        console.error("Error in homepage:", error);
    }
});

// تابع بارگذاری داده‌های داشبورد
async function loadDashboardData() {
    if (isDashboardLoading) {
        console.log("Dashboard data is already loading, skipping...");
        return;
    }
    
    isDashboardLoading = true;
    
    try {
        // بررسی اتصال کیف پول
        const connection = await checkConnection();
        if (!connection.connected) {
            console.log("Wallet not connected, skipping dashboard update");
            return;
        }

        // دریافت قیمت‌ها
        const prices = await getPrices();
        
        // دریافت آمار قرارداد
        const stats = await getContractStats();
        
        // دریافت اطلاعات اضافی
        const additionalStats = await getAdditionalStats();
        
        // دریافت حجم معاملات
        const tradingVolume = await getTradingVolume();

        // محاسبه درصد تغییرات
        const priceChanges = await calculatePriceChanges();

        // به‌روزرسانی UI
        updateDashboardUI(prices, stats, additionalStats, tradingVolume, priceChanges);

    } catch (error) {
        console.error("Error loading dashboard data:", error);
        // اگر خطای اتصال بود، بعد از 5 ثانیه دوباره تلاش کن
        if (error.message.includes('Failed to connect') || error.message.includes('Wallet not connected')) {
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
        const tradingVolumeNum = parseFloat(tradingVolume.totalVolume);
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
        
        const address = await window.contractConfig.signer.getAddress();
        if (!address) {
            return {
                connected: false,
                error: "No wallet address"
            };
        }
        
        const provider = window.contractConfig.provider;
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
        while (window.contractConfig.isConnecting && waitCount < 30) { // حداکثر 3 ثانیه
            await new Promise(resolve => setTimeout(resolve, 100));
            waitCount++;
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

// تابع دریافت قیمت‌ها
async function getPrices() {
    try {
        const { contract } = await connectWallet();
        
        const [tokenPrice, maticPrice, registrationPrice, tokenPriceUSD] = await Promise.all([
            contract.updateTokenPrice(),
            contract.getLatestMaticPrice(),
            contract.getRegistrationPrice(),
            contract.getTokenPriceInUSD()
        ]);
        
        // فرمت کردن قیمت‌ها
        const formattedTokenPrice = ethers.formatUnits(tokenPrice, 18);
        const formattedMaticPrice = ethers.formatUnits(maticPrice, 8);
        const formattedRegistrationPrice = ethers.formatEther(registrationPrice);
        const formattedTokenPriceUSD = ethers.formatUnits(tokenPriceUSD, 8);
        
        return {
            tokenPrice: formattedTokenPrice,
            maticPrice: formattedMaticPrice,
            registrationPrice: formattedRegistrationPrice,
            tokenPriceUSD: formattedTokenPriceUSD
        };
    } catch (error) {
        console.error("Error fetching prices:", error);
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
        const { contract } = await connectWallet();
        
        const [totalUsers, totalSupply, binaryPool, rewardPool, totalPoints, totalDirectDeposits, contractBalance] = 
            await Promise.all([
                contract.totalUsers(),
                contract.totalSupply(),
                contract.binaryPool(),
                contract.rewardPool(),
                contract.totalPoints(),
                contract.totalDirectDeposits(),
                contract.getContractMaticBalance()
            ]);
        
        // محاسبه circulating supply (کل عرضه منهای موجودی قرارداد)
        const totalSupplyNum = parseFloat(ethers.formatUnits(totalSupply, 18));
        const contractBalanceNum = parseFloat(ethers.formatEther(contractBalance));
        const circulatingSupplyNum = Math.max(0, totalSupplyNum - contractBalanceNum);
        
        return {
            totalUsers: totalUsers.toString(),
            totalSupply: ethers.formatUnits(totalSupply, 18),
            circulatingSupply: circulatingSupplyNum.toString(),
            binaryPool: ethers.formatEther(binaryPool),
            rewardPool: ethers.formatEther(rewardPool),
            totalPoints: ethers.formatUnits(totalPoints, 18),
            totalDirectDeposits: ethers.formatEther(totalDirectDeposits)
        };
    } catch (error) {
        console.error("Error fetching contract stats:", error);
        return {
            totalUsers: "0",
            totalSupply: "0",
            circulatingSupply: "0",
            binaryPool: "0",
            rewardPool: "0",
            totalPoints: "0",
            totalDirectDeposits: "0"
        };
    }
}

// تابع محاسبه اطلاعات اضافی
async function getAdditionalStats() {
    try {
        const { contract } = await connectWallet();
        
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
        const { contract } = await connectWallet();
        
        let totalDeposits = "0";
        let contractBalance = "0";
        let totalVolume = "0";
        
        // دریافت کل سپرده‌های مستقیم
        try {
            const depositsRaw = await contract.totalDirectDeposits();
            totalDeposits = ethers.formatEther(depositsRaw);
        } catch (error) {
            console.error("Error getting totalDirectDeposits:", error);
        }
        
        // دریافت موجودی قرارداد
        try {
            const balanceRaw = await contract.getContractMaticBalance();
            contractBalance = ethers.formatEther(balanceRaw);
        } catch (balanceError) {
            console.error("Error getting contract balance:", balanceError);
        }
        
        // محاسبه کل حجم معاملات (سپرده‌ها + موجودی فعلی)
        const depositsNum = parseFloat(totalDeposits);
        const balanceNum = parseFloat(contractBalance);
        totalVolume = (depositsNum + balanceNum).toString();
        
        return {
            totalDeposits,
            contractBalance,
            totalVolume
        };
    } catch (error) {
        console.error("Error in getTradingVolume:", error);
        return {
            totalDeposits: "0",
            contractBalance: "0",
            totalVolume: "0"
        };
    }
}