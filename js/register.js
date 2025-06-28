// register.js - مدیریت بخش ثبت‌نام و ارتقا
let isRegisterLoading = false;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log("Register section loaded, waiting for wallet connection...");
        // Register data will be loaded when tab is selected
    } catch (error) {
        console.error("Error in register section:", error);
    }
});

// تابع بارگذاری اطلاعات ثبت‌نام
async function loadRegisterData() {
    if (isRegisterLoading) {
        console.log("Register already loading, skipping...");
        return;
    }
    
    isRegisterLoading = true;
    
    try {
        console.log("Connecting to wallet for register data...");
        const { contract, address } = await connectWallet();
        console.log("Wallet connected, loading register data...");
        
        // دریافت اطلاعات کاربر
        const userData = await contract.users(address);
        
        // دریافت موجودی LVL کاربر
        const lvlBalance = await contract.balanceOf(address);
        const lvlBalanceFormatted = ethers.formatUnits(lvlBalance, 18);
        
        // دریافت قیمت‌ها
        const [tokenPriceUSD, registrationPrice] = await Promise.all([
            contract.getTokenPriceInUSD(),
            contract.getRegistrationPrice()
        ]);
        
        const tokenPriceUSDFormatted = ethers.formatUnits(tokenPriceUSD, 8);
        const registrationPriceFormatted = ethers.formatEther(registrationPrice);
        
        // محاسبه ارزش دلاری موجودی
        const lvlBalanceUSD = (parseFloat(lvlBalanceFormatted) * parseFloat(tokenPriceUSDFormatted)).toFixed(2);
        
        // به‌روزرسانی نمایش موجودی
        updateBalanceDisplay(lvlBalanceFormatted, lvlBalanceUSD);
        
        // بررسی وضعیت ثبت‌نام
        if (userData.activated) {
            // کاربر قبلاً ثبت‌نام کرده - نمایش فرم ارتقا
            showUpgradeForm();
            await loadUpgradeData(contract, address, tokenPriceUSDFormatted);
        } else {
            // کاربر جدید - نمایش فرم ثبت‌نام
            showRegistrationForm(registrationPriceFormatted, lvlBalanceFormatted, tokenPriceUSDFormatted);
        }
        
        console.log("Register data loaded successfully");
        
    } catch (error) {
        console.error("Error loading register data:", error);
        showRegisterError("خطا در بارگذاری اطلاعات ثبت‌نام");
    } finally {
        isRegisterLoading = false;
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
    
    return {
        provider: window.contractConfig.provider,
        contract: window.contractConfig.contract,
        signer: window.contractConfig.signer,
        address: await window.contractConfig.signer.getAddress()
    };
}

// تابع به‌روزرسانی نمایش موجودی
function updateBalanceDisplay(lvlBalance, lvlBalanceUSD) {
    const balanceElement = document.getElementById('user-lvl-balance');
    const usdElement = document.getElementById('user-lvl-usd-value');
    
    if (balanceElement) {
        balanceElement.textContent = `${parseFloat(lvlBalance).toLocaleString('en-US', {maximumFractionDigits: 2})} LVL`;
    }
    
    if (usdElement) {
        usdElement.textContent = `~$${lvlBalanceUSD} USD`;
    }
}

// تابع نمایش فرم ثبت‌نام
function showRegistrationForm(registrationPrice, userBalance, tokenPriceUSD) {
    const registrationForm = document.getElementById('registration-form');
    const upgradeForm = document.getElementById('upgrade-form');
    
    if (registrationForm) registrationForm.style.display = 'block';
    if (upgradeForm) upgradeForm.style.display = 'none';
    
    // به‌روزرسانی اطلاعات ثبت‌نام
    const requiredElement = document.getElementById('registration-required');
    const statusElement = document.getElementById('registration-status-text');
    
    if (requiredElement) {
        const requiredUSD = (parseFloat(registrationPrice) * parseFloat(tokenPriceUSD)).toFixed(2);
        requiredElement.textContent = `${parseFloat(registrationPrice).toFixed(2)} LVL (~$${requiredUSD} USD)`;
    }
    
    if (statusElement) {
        const userBalanceNum = parseFloat(userBalance);
        const requiredNum = parseFloat(registrationPrice);
        
        if (userBalanceNum >= requiredNum) {
            statusElement.textContent = "آماده برای ثبت‌نام";
            statusElement.style.color = "#4caf50";
        } else {
            statusElement.textContent = "موجودی ناکافی";
            statusElement.style.color = "#ff4444";
        }
    }
    
    // راه‌اندازی دکمه ثبت‌نام
    setupRegistrationButton();
}

// تابع نمایش فرم ارتقا
function showUpgradeForm() {
    const registrationForm = document.getElementById('registration-form');
    const upgradeForm = document.getElementById('upgrade-form');
    
    if (registrationForm) registrationForm.style.display = 'none';
    if (upgradeForm) upgradeForm.style.display = 'block';
    
    // راه‌اندازی فرم ارتقا
    setupUpgradeForm();
}

// تابع بارگذاری اطلاعات ارتقا
async function loadUpgradeData(contract, address, tokenPriceUSD) {
    try {
        const userData = await contract.users(address);
        const lvlBalance = await contract.balanceOf(address);
        const lvlBalanceFormatted = ethers.formatUnits(lvlBalance, 18);
        
        // به‌روزرسانی محاسبات ارتقا
        updateUpgradeCalculations(lvlBalanceFormatted, tokenPriceUSD, userData.binaryPointCap);
        
    } catch (error) {
        console.error("Error loading upgrade data:", error);
    }
}

// تابع به‌روزرسانی محاسبات ارتقا
function updateUpgradeCalculations(lvlBalance, tokenPriceUSD, currentCap) {
    const upgradeAmountInput = document.getElementById('upgrade-amount');
    const usdValueElement = document.getElementById('upgrade-usd-value');
    const pointsGainElement = document.getElementById('upgrade-points-gain');
    const upgradeBtn = document.getElementById('upgrade-btn');
    
    if (upgradeAmountInput) {
        upgradeAmountInput.addEventListener('input', function() {
            const amount = parseFloat(this.value) || 0;
            const usdValue = (amount * parseFloat(tokenPriceUSD)).toFixed(2);
            const pointsGain = Math.floor(parseFloat(usdValue) / 50);
            const newCap = Math.min(100, currentCap + pointsGain);
            
            if (usdValueElement) {
                usdValueElement.textContent = `$${usdValue} USD`;
            }
            
            if (pointsGainElement) {
                pointsGainElement.textContent = `${pointsGain} امتیاز (سقف جدید: ${newCap})`;
            }
            
            if (upgradeBtn) {
                const userBalanceNum = parseFloat(lvlBalance);
                upgradeBtn.disabled = amount <= 0 || amount > userBalanceNum;
            }
        });
    }
}

// تابع راه‌اندازی دکمه ثبت‌نام
function setupRegistrationButton() {
    const registerBtn = document.getElementById('register-btn');
    if (registerBtn) {
        registerBtn.onclick = async () => {
            try {
                await performRegistration();
            } catch (error) {
                console.error("Registration error:", error);
                showRegisterError("خطا در ثبت‌نام");
            }
        };
    }
}

// تابع راه‌اندازی فرم ارتقا
function setupUpgradeForm() {
    const upgradeBtn = document.getElementById('upgrade-btn');
    if (upgradeBtn) {
        upgradeBtn.onclick = async () => {
            try {
                await performUpgrade();
            } catch (error) {
                console.error("Upgrade error:", error);
                showRegisterError("خطا در ارتقا");
            }
        };
    }
}

// تابع انجام ثبت‌نام
async function performRegistration() {
    try {
        const { contract, address } = await connectWallet();
        
        // دریافت آدرس معرف (در اینجا از deployer استفاده می‌کنیم)
        const deployer = await contract.deployer();
        
        // دریافت قیمت ثبت‌نام
        const registrationPrice = await contract.getRegistrationPrice();
        
        // انجام تراکنش ثبت‌نام
        const tx = await contract.registerAndActivate(deployer, registrationPrice);
        await tx.wait();
        
        showRegisterSuccess("ثبت‌نام با موفقیت انجام شد!");
        
        // بارگذاری مجدد اطلاعات
        setTimeout(() => {
            loadRegisterData();
        }, 2000);
        
    } catch (error) {
        console.error("Registration failed:", error);
        throw error;
    }
}

// تابع انجام ارتقا
async function performUpgrade() {
    try {
        const { contract } = await connectWallet();
        const upgradeAmountInput = document.getElementById('upgrade-amount');
        const amount = parseFloat(upgradeAmountInput.value);
        
        if (!amount || amount <= 0) {
            throw new Error("مقدار نامعتبر");
        }
        
        const amountInWei = ethers.parseUnits(amount.toString(), 18);
        
        // انجام تراکنش ارتقا
        const tx = await contract.purchase(amountInWei, 100); // 100% payout
        await tx.wait();
        
        showRegisterSuccess("ارتقا با موفقیت انجام شد!");
        
        // بارگذاری مجدد اطلاعات
        setTimeout(() => {
            loadRegisterData();
        }, 2000);
        
    } catch (error) {
        console.error("Upgrade failed:", error);
        throw error;
    }
}

// تابع نمایش پیام موفقیت
function showRegisterSuccess(message) {
    const statusElement = document.getElementById('register-status');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = 'profile-status success';
    }
}

// تابع نمایش پیام خطا
function showRegisterError(message) {
    const statusElement = document.getElementById('register-status');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = 'profile-status error';
    }
} 