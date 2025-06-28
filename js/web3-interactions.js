// web3-interactions.js

// تابع اتصال کیف پول
// web3-interactions.js
async function connectWallet() {
    try {
        // بررسی وجود ethers.js
        if (typeof ethers === 'undefined') {
            throw new Error("Ethers.js library not loaded");
        }

        // اگر WalletConnect متصل است، از آن استفاده کن
        if (window.contractConfig.walletConnectProvider) {
            return {
                provider: window.contractConfig.provider,
                signer: window.contractConfig.signer,
                contract: window.contractConfig.contract,
                address: await window.contractConfig.signer.getAddress()
            };
        }

        // در غیر این صورت از متامسک استفاده کن
        const initialized = await window.contractConfig.initializeWeb3();
        if (!initialized) {
            throw new Error("Web3 initialization failed");
        }

        const address = await window.contractConfig.signer.getAddress();
        
        return {
            provider: window.contractConfig.provider,
            signer: window.contractConfig.signer,
            contract: window.contractConfig.contract,
            address
        };
    } catch (error) {
        console.error("Wallet connection error:", error);
        throw error;
    }
}

// تابع قطع ارتباط
async function disconnectWallet() {
    try {
        if (window.contractConfig.walletConnectProvider) {
            window.contractConfig.disconnectWalletConnect();
        }
        
        // ریست کردن وضعیت اتصال
        window.contractConfig.provider = null;
        window.contractConfig.signer = null;
        window.contractConfig.contract = null;
        
        // به‌روزرسانی UI
        const connectButton = document.getElementById('connectButton');
        const walletConnectButton = document.getElementById('walletConnectButton');
        
        if (connectButton) {
            connectButton.textContent = 'اتصال با متامسک';
            connectButton.style.background = '';
            connectButton.disabled = false;
        }
        
        if (walletConnectButton) {
            walletConnectButton.textContent = 'اتصال با WalletConnect';
            walletConnectButton.style.background = '';
            walletConnectButton.disabled = false;
        }
        
        return { success: true };
    } catch (error) {
        console.error("Disconnection error:", error);
        throw error;
    }
}
// تابع دریافت پروفایل کاربر
async function fetchUserProfile() {
    try {
        // اتصال به کیف پول
        const { provider, contract, address } = await connectWallet();

        // دریافت موجودی‌ها به صورت موازی
        const [maticBalance, lvlBalance, userData] = await Promise.all([
            provider.getBalance(address),
            contract.balanceOf(address),
            contract.users(address)
        ]);

        return {
            address,
            maticBalance: ethers.formatEther(maticBalance),
            lvlBalance: ethers.formatUnits(lvlBalance, 18),
            isRegistered: userData.activated,
            binaryPoints: ethers.formatUnits(userData.binaryPoints, 18),
            binaryPointCap: ethers.formatUnits(userData.binaryPointCap, 18),
            referrer: userData.referrer
        };
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
}

// تابع خرید توکن
async function buyTokens(maticAmount) {
    try {
        const { contract } = await connectWallet();
        
        // تبدیل به Wei
        const amountInWei = ethers.parseEther(maticAmount.toString());
        
        // تخمین تعداد توکن دریافتی
        const estimatedTokens = await contract.estimateBuy(amountInWei);
        
        // انجام تراکنش خرید
        const tx = await contract.buyTokens({ value: amountInWei });
        await tx.wait();
        
        return {
            success: true,
            estimatedTokens: ethers.formatUnits(estimatedTokens, 18),
            transactionHash: tx.hash
        };
    } catch (error) {
        console.error("Error buying tokens:", error);
        throw error;
    }
}

// تابع فروش توکن
async function sellTokens(tokenAmount) {
    try {
        const { contract } = await connectWallet();
        
        // تبدیل به Wei
        const amountInWei = ethers.parseUnits(tokenAmount.toString(), 18);
        
        // تخمین MATIC دریافتی
        const estimatedMatic = await contract.estimateSell(amountInWei);
        
        // انجام تراکنش فروش
        const tx = await contract.sellTokens(amountInWei);
        await tx.wait();
        
        return {
            success: true,
            estimatedMatic: ethers.formatEther(estimatedMatic),
            transactionHash: tx.hash
        };
    } catch (error) {
        console.error("Error selling tokens:", error);
        throw error;
    }
}

// تابع ثبت‌نام و فعال‌سازی
async function registerAndActivate(referrerAddress, tokenAmount) {
    try {
        const { contract } = await connectWallet();
        
        // تبدیل به Wei
        const amountInWei = ethers.parseUnits(tokenAmount.toString(), 18);
        
        // انجام تراکنش ثبت‌نام
        const tx = await contract.registerAndActivate(referrerAddress, amountInWei);
        await tx.wait();
        
        return {
            success: true,
            transactionHash: tx.hash
        };
    } catch (error) {
        console.error("Error registering user:", error);
        throw error;
    }
}

// تابع برداشت پاداش
async function claimRewards() {
    try {
        const { contract } = await connectWallet();
        
        // بررسی امکان برداشت
        const isClaimable = await contract.isClaimable(await window.contractConfig.signer.getAddress());
        if (!isClaimable) {
            throw new Error("شما واجد شرایط برداشت نیستید");
        }
        
        // انجام تراکنش برداشت
        const tx = await contract.claim();
        await tx.wait();
        
        return {
            success: true,
            transactionHash: tx.hash
        };
    } catch (error) {
        console.error("Error claiming rewards:", error);
        throw error;
    }
}

// تابع دریافت اطلاعات درخت کاربر
async function getUserTree(userAddress) {
    try {
        const { contract } = await connectWallet();
        
        const [left, right, activated, binaryPoints, binaryPointCap] = 
            await contract.getUserTree(userAddress);
        
        return {
            left,
            right,
            activated,
            binaryPoints: ethers.formatUnits(binaryPoints, 18),
            binaryPointCap: ethers.formatUnits(binaryPointCap, 18)
        };
    } catch (error) {
        console.error("Error fetching user tree:", error);
        throw error;
    }
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
        
        // استفاده از قیمت واقعی بدون بررسی حداقل
        const finalTokenPriceUSD = formattedTokenPriceUSD;
        
        return {
            tokenPrice: formattedTokenPrice,
            maticPrice: formattedMaticPrice,
            registrationPrice: formattedRegistrationPrice,
            tokenPriceUSD: finalTokenPriceUSD
        };
    } catch (error) {
        console.error("Error fetching prices:", error);
        // برگرداندن قیمت‌های پیش‌فرض در صورت خطا
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
        
        const [totalUsers, totalSupply, circulatingSupply, binaryPool, rewardPool, totalPoints, totalDirectDeposits] = 
            await Promise.all([
                contract.totalUsers(),
                contract.totalSupply(),
                contract.circulatingSupply(),
                contract.binaryPool(),
                contract.rewardPool(),
                contract.totalPoints(),
                contract.totalDirectDeposits()
            ]);
        
        return {
            totalUsers: totalUsers.toString(),
            totalSupply: ethers.formatUnits(totalSupply, 18),
            circulatingSupply: ethers.formatUnits(circulatingSupply, 18),
            binaryPool: ethers.formatEther(binaryPool),
            rewardPool: ethers.formatEther(rewardPool),
            totalPoints: ethers.formatUnits(totalPoints, 18),
            totalDirectDeposits: ethers.formatEther(totalDirectDeposits)
        };
    } catch (error) {
        console.error("Error fetching contract stats:", error);
        throw error;
    }
}

// تابع عمومی برای فراخوانی توابع قرارداد
async function callContractFunction(functionName, ...args) {
    try {
        const { contract } = await connectWallet();
        return await contract[functionName](...args);
    } catch (error) {
        console.error(`Error calling ${functionName}:`, error);
        throw error;
    }
}

// تابع بررسی وضعیت اتصال
async function checkConnection() {
    try {
        const { provider, address } = await connectWallet();
        const network = await provider.getNetwork();
        
        return {
            connected: true,
            address,
            network: network.name,
            chainId: network.chainId
        };
    } catch (error) {
        return {
            connected: false,
            error: error.message
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
            // اطمینان از اینکه remaining points منفی نباشد
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
        
        // دریافت کل سپرده‌های مستقیم
        try {
            const depositsRaw = await contract.totalDirectDeposits();
            const formatted = ethers.formatEther(depositsRaw);
            totalDeposits = formatted;
        } catch (error) {
            // totalDirectDeposits failed
        }
        
        // دریافت موجودی قرارداد
        try {
            const balanceRaw = await contract.getContractMaticBalance();
            const formatted = ethers.formatEther(balanceRaw);
            contractBalance = formatted;
        } catch (balanceError) {
            // Contract balance failed
        }
        
        return {
            totalDeposits,
            contractBalance
        };
    } catch (error) {
        console.error("Error in getTradingVolume:", error);
        return {
            totalDeposits: "0",
            contractBalance: "0"
        };
    }
}