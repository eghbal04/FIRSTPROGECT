// register.js - مدیریت بخش ثبت‌نام و ارتقا
let isRegisterLoading = false;
let registerDataLoaded = false;
let registerTabSelected = false;

document.addEventListener('DOMContentLoaded', function() {
    // Register section loaded, waiting for wallet connection...
});

// تابع بارگذاری اطلاعات ثبت‌نام
async function loadRegisterData() {
    if (isRegisterLoading || registerDataLoaded) {
        console.log('Register: Already loading or loaded, skipping...');
        return;
    }
    
    // فقط اگر تب register انتخاب شده باشد
    if (!registerTabSelected) {
        console.log('Register: Tab not selected, skipping...');
        return;
    }
    
    isRegisterLoading = true;
    
    try {
        console.log('Register: Loading register data...');
        
        // بررسی اتصال کیف پول
        if (!window.contractConfig || !window.contractConfig.contract) {
            console.log('Register: No wallet connection, skipping...');
            return;
        }
        
        const { contract, address } = window.contractConfig;
        console.log('Register: Wallet connected, loading register data...');
        
        // دریافت اطلاعات کاربر
        const userData = await contract.users(address);
        
        // دریافت موجودی LVL کاربر
        const lvlBalance = await contract.balanceOf(address);
        const lvlBalanceFormatted = ethers.formatUnits(lvlBalance, 18);
        
        // دریافت قیمت‌ها و اطلاعات ثبت‌نام
        const [regprice, tokenPriceMatic] = await Promise.all([
            contract.regprice(),
            contract.getTokenPrice() // قیمت توکن بر حسب MATIC
        ]);
        const tokenPriceMaticFormatted = ethers.formatUnits(tokenPriceMatic, 18);
        // دریافت قیمت MATIC/USD از API
        const maticPriceUSD = await window.fetchPolUsdPrice();
        const maticPriceUSDFormatted = parseFloat(maticPriceUSD).toFixed(6);
        // قیمت LVL/USD = (LVL/MATIC) * (MATIC/USD)
        const tokenPriceUSD = parseFloat(tokenPriceMaticFormatted) * parseFloat(maticPriceUSD);
        const tokenPriceUSDFormatted = tokenPriceUSD.toFixed(6);
        const regpriceFormatted = ethers.formatUnits(regprice, 18); // مقدار توکن مورد نیاز
        const regpriceUSD = ethers.formatUnits(regprice, 8); // مقدار دلاری
        // محاسبه مقدار توکن برای 1 سنت و ...
        const oneCentInUSD = 0.01;
        const oneCentInMatic = (oneCentInUSD * 1e18) / parseFloat(maticPriceUSDFormatted);
        const oneCentTokens = (oneCentInMatic * 1e18) / parseFloat(tokenPriceMaticFormatted);
        const oneCentTokensFormatted = oneCentTokens.toFixed(6);
        const tenCentsInUSD = 0.1;
        const tenCentsInMatic = (tenCentsInUSD * 1e18) / parseFloat(maticPriceUSDFormatted);
        const tenCentsInTokens = (tenCentsInMatic * 1e18) / parseFloat(tokenPriceMaticFormatted);
        const tenCentsInTokensFormatted = tenCentsInTokens.toFixed(6);
        const twelveCentsInUSD = 0.12;
        const twelveCentsInMatic = (twelveCentsInUSD * 1e18) / parseFloat(maticPriceUSDFormatted);
        const twelveCentsInTokens = (twelveCentsInMatic * 1e18) / parseFloat(tokenPriceMaticFormatted);
        const twelveCentsInTokensFormatted = twelveCentsInTokens.toFixed(6);
        // محاسبه ارزش دلاری موجودی
        const lvlBalanceUSD = (parseFloat(lvlBalanceFormatted) * parseFloat(tokenPriceUSDFormatted)).toFixed(2);
        // به‌روزرسانی نمایش موجودی
        updateBalanceDisplay(lvlBalanceFormatted, lvlBalanceUSD);
        // بررسی وضعیت ثبت‌نام
        if (userData.activated) {
            showUpgradeForm(userData.totalPurchasedKind);
            await loadUpgradeData(contract, address, tokenPriceUSDFormatted);
        } else {
            showRegistrationForm(regpriceFormatted, lvlBalanceFormatted, tokenPriceUSDFormatted, regpriceUSD, tokenPriceMaticFormatted, oneCentTokensFormatted, tenCentsInTokensFormatted, twelveCentsInTokensFormatted, userData.totalPurchasedKind);
        }
        registerDataLoaded = true;
        console.log('Register: Data loaded successfully');
        
    } catch (error) {
        console.error('Error loading register data:', error);
        showRegisterError("خطا در بارگذاری اطلاعات ثبت‌نام");
    } finally {
        isRegisterLoading = false;
    }
}

// تابع تنظیم وضعیت تب register
function setRegisterTabSelected(selected) {
    registerTabSelected = selected;
    if (selected && !registerDataLoaded) {
        // ریست کردن وضعیت بارگذاری برای بارگذاری مجدد
        registerDataLoaded = false;
        isRegisterLoading = false;
    }
}

// Export function for global use
window.setRegisterTabSelected = setRegisterTabSelected;

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
        // استفاده از اتصال موجود به جای فراخوانی connectWallet
        if (!window.contractConfig || !window.contractConfig.contract) {
            throw new Error('No wallet connection');
        }
        
        const { contract, address } = window.contractConfig;
        
        // دریافت معرف واقعی کاربر (از URL یا localStorage)
        let referrerAddress = getReferrerFromURL() || getReferrerFromStorage();
        
        // اگر معرفی وجود نداشت، از deployer استفاده کن
        if (!referrerAddress) {
            referrerAddress = await contract.deployer();
            console.log('Register: No referrer found, using deployer:', referrerAddress);
        } else {
            console.log('Register: Using referrer from URL/storage:', referrerAddress);
        }
        
        // بررسی معتبر بودن معرف
        try {
            const referrerData = await contract.users(referrerAddress);
            if (!referrerData.activated) {
                throw new Error('Referrer is not activated');
            }
        } catch (error) {
            console.log('Register: Invalid referrer, using deployer instead');
            referrerAddress = await contract.deployer();
        }
        
        // دریافت قیمت ثبت‌نام
        const regprice = await contract.regprice();
        
        // انجام تراکنش ثبت‌نام
        const tx = await contract.registerAndActivate(referrerAddress, regprice);
        await tx.wait();
        
        showRegisterSuccess("ثبت‌نام با موفقیت انجام شد!");
        
        // ریست کردن وضعیت بارگذاری برای بارگذاری مجدد
        registerDataLoaded = false;
        
        // بارگذاری مجدد اطلاعات
        setTimeout(() => {
            loadRegisterData();
        }, 2000);
        
    } catch (error) {
        console.error("Registration failed:", error);
        throw error;
    }
}

// تابع دریافت معرف از URL
function getReferrerFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ref') || urlParams.get('referrer');
}

// تابع دریافت معرف از localStorage
function getReferrerFromStorage() {
    return localStorage.getItem('referrer') || localStorage.getItem('ref');
}

// تابع انجام ارتقا
async function performUpgrade() {
    try {
        // استفاده از اتصال موجود به جای فراخوانی connectWallet
        if (!window.contractConfig || !window.contractConfig.contract) {
            throw new Error('No wallet connection');
        }
        
        const { contract, address } = window.contractConfig;
        
        const upgradeAmountInput = document.getElementById('upgrade-amount');
        const amount = parseFloat(upgradeAmountInput.value);
        
        if (!amount || amount <= 0) {
            throw new Error('Invalid upgrade amount');
        }
        
        // تبدیل مقدار به wei
        const amountInWei = ethers.parseUnits(amount.toString(), 18);
        
        // انجام تراکنش ارتقا
        const tx = await contract.purchase(amountInWei, 0);
        await tx.wait();
        
        showRegisterSuccess("ارتقا با موفقیت انجام شد!");
        
        // ریست کردن وضعیت بارگذاری برای بارگذاری مجدد
        registerDataLoaded = false;
        
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

// تابع به‌روزرسانی نمایش موجودی
function updateBalanceDisplay(lvlBalance, lvlBalanceUSD) {
    const lvlBalanceElement = document.getElementById('user-lvl-balance');
    const lvlUsdElement = document.getElementById('user-lvl-usd-value');
    
    if (lvlBalanceElement) {
        lvlBalanceElement.textContent = `${parseFloat(lvlBalance).toFixed(2)} LVL`;
    }
    
    if (lvlUsdElement) {
        lvlUsdElement.textContent = `$${lvlBalanceUSD} USD`;
    }
}

// تابع نمایش اطلاعات کامل ثبت‌نام
function displayRegistrationInfo(registrationPrice, regprice, tokenPriceUSD, tokenPriceMatic, oneCentTokens, tenCentsTokens, twelveCentsTokens) {
    const infoContainer = document.getElementById('registration-info');
    if (infoContainer) {
        const infoHTML = `
            <div style="background: rgba(0, 0, 0, 0.6); border-radius: 8px; padding: 1rem; margin: 1rem 0; border-left: 3px solid #a786ff;">
                <h4 style="color: #a786ff; margin-bottom: 0.8rem;">📊 اطلاعات ثبت‌نام</h4>
                <div style="display: grid; gap: 0.5rem; font-size: 0.9rem;">
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #ccc;">مقدار توکن مورد نیاز (دقیقاً طبق قرارداد):</span>
                        <span style="color: #00ff88; font-weight: bold;">${registrationPrice} LVL</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #ccc;">ارزش دلاری (هدف قرارداد):</span>
                        <span style="color: #00ccff; font-weight: bold;">$0.01 USD</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #ccc;">قیمت فعلی توکن (دلار):</span>
                        <span style="color: #ffffff; font-weight: bold;">$${tokenPriceUSD} USD</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #ccc;">قیمت فعلی توکن (MATIC):</span>
                        <span style="color: #ff9500; font-weight: bold;">${tokenPriceMatic} MATIC</span>
                    </div>
                </div>
                <div style="font-size: 0.85rem; color: #aaa; margin-top: 0.7rem;">
                    مقدار توکن مورد نیاز برای ثبت‌نام دقیقاً همان خروجی تابع <b>getRegistrationPrice</b> قرارداد است و معادل ۱ سنت (۰.۰۱ دلار) می‌باشد.
                </div>
            </div>
        `;
        infoContainer.innerHTML = infoHTML;
    }
}

// تابع نمایش فرم ثبت‌نام
function showRegistrationForm(registrationPrice, userBalance, tokenPriceUSD, regprice, tokenPriceMatic, oneCentTokens, tenCentsTokens, twelveCentsTokens, totalPurchasedKind) {
    const registrationForm = document.getElementById('registration-form');
    const upgradeForm = document.getElementById('upgrade-form');
    
    if (registrationForm) {
        registrationForm.style.display = 'block';
    }
    
    if (upgradeForm) {
        upgradeForm.style.display = 'none';
    }
    
    // نمایش اطلاعات کامل ثبت‌نام
    displayRegistrationInfo(registrationPrice, regprice, tokenPriceUSD, tokenPriceMatic, oneCentTokens, tenCentsTokens, twelveCentsTokens);
    
    // نمایش مقایسه قیمت‌ها
    displayPriceComparison(tokenPriceUSD, tokenPriceMatic, registrationPrice, oneCentTokens, tenCentsTokens, twelveCentsTokens);
    
    // نمایش پس‌انداز خرید پوینت
    const purchasedKindBox = document.getElementById('registration-purchased-kind');
    if (purchasedKindBox) {
        purchasedKindBox.innerHTML = `<div style="background: rgba(167,134,255,0.12); border-radius: 8px; padding: 0.7rem 1rem; margin: 0.7rem 0; border-right: 3px solid #a786ff; display: flex; justify-content: space-between; align-items: center;">
            <span style='color:#a786ff;'>پس‌انداز خرید پوینت:</span>
            <span style='color:#fff; font-weight:bold;'>${totalPurchasedKind || '۰'}</span>
        </div>`;
    }
    
    // به‌روزرسانی اطلاعات فرم
    const requiredElement = document.getElementById('registration-required');
    const statusElement = document.getElementById('registration-status-text');
    const registerBtn = document.getElementById('register-btn');
    
    if (requiredElement) {
        // نمایش هم مقدار توکن و هم مقدار دلاری
        requiredElement.textContent = `${registrationPrice} LVL ($${regprice} USD)`;
    }
    
    if (statusElement) {
        const userBalanceNum = parseFloat(userBalance);
        const requiredNum = parseFloat(registrationPrice);
        
        if (userBalanceNum >= requiredNum) {
            statusElement.textContent = 'آماده برای ثبت‌نام';
            statusElement.style.color = '#4caf50';
            if (registerBtn) registerBtn.disabled = false;
        } else {
            statusElement.textContent = 'موجودی ناکافی';
            statusElement.style.color = '#f44336';
            if (registerBtn) registerBtn.disabled = true;
        }
    }
    
    // راه‌اندازی دکمه ثبت‌نام
    setupRegistrationButton();
}

// تابع نمایش فرم ارتقا
function showUpgradeForm(totalPurchasedKind) {
    const registrationForm = document.getElementById('registration-form');
    const upgradeForm = document.getElementById('upgrade-form');
    
    if (registrationForm) {
        registrationForm.style.display = 'none';
    }
    
    if (upgradeForm) {
        upgradeForm.style.display = 'block';
    }
    
    // راه‌اندازی فرم ارتقا
    setupUpgradeForm();
    
    // نمایش پس‌انداز خرید پوینت
    const purchasedKindBox = document.getElementById('upgrade-purchased-kind');
    if (purchasedKindBox) {
        purchasedKindBox.innerHTML = `<div style="background: rgba(167,134,255,0.12); border-radius: 8px; padding: 0.7rem 1rem; margin: 0.7rem 0; border-right: 3px solid #a786ff; display: flex; justify-content: space-between; align-items: center;">
            <span style='color:#a786ff;'>پس‌انداز خرید پوینت:</span>
            <span style='color:#fff; font-weight:bold;'>${totalPurchasedKind || '۰'}</span>
        </div>`;
    }
}

// تابع نمایش مقایسه قیمت‌ها
function displayPriceComparison(tokenPriceUSD, tokenPriceMatic, registrationPrice, oneCentTokens, tenCentsTokens, twelveCentsTokens) {
    const comparisonContainer = document.getElementById('price-comparison');
    if (comparisonContainer) {
        // محاسبه تفاوت درصدی
        const usdPrice = parseFloat(tokenPriceUSD);
        const maticPrice = parseFloat(tokenPriceMatic);
        const difference = Math.abs(usdPrice - maticPrice);
        const percentageDiff = ((difference / Math.max(usdPrice, maticPrice)) * 100).toFixed(2);
        
        // محاسبه تفاوت بین قیمت ثبت‌نام و قیمت محاسبه شده
        const registrationPriceNum = parseFloat(registrationPrice);
        const tenCentsTokensNum = parseFloat(tenCentsTokens);
        const twelveCentsTokensNum = parseFloat(twelveCentsTokens);
        const priceDifference = Math.abs(registrationPriceNum - tenCentsTokensNum);
        const pricePercentageDiff = ((priceDifference / Math.max(registrationPriceNum, tenCentsTokensNum)) * 100).toFixed(2);
        
        // محاسبه تفاوت بین قیمت ثبت‌نام و 12 سنت
        const priceDifference12 = Math.abs(registrationPriceNum - twelveCentsTokensNum);
        const pricePercentageDiff12 = ((priceDifference12 / Math.max(registrationPriceNum, twelveCentsTokensNum)) * 100).toFixed(2);
        
        const comparisonHTML = `
            <div style="background: rgba(255, 149, 0, 0.1); border-radius: 8px; padding: 1rem; margin: 1rem 0; border-left: 3px solid #ff9500;">
                <h4 style="color: #ff9500; margin-bottom: 0.8rem;">⚠️ مقایسه قیمت‌ها</h4>
                <div style="display: grid; gap: 0.5rem; font-size: 0.9rem;">
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #ccc;">قیمت دلاری (Chainlink):</span>
                        <span style="color: #00ccff; font-weight: bold;">$${tokenPriceUSD} USD</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #ccc;">قیمت MATIC (قرارداد):</span>
                        <span style="color: #ff9500; font-weight: bold;">${tokenPriceMatic} MATIC</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #ccc;">تفاوت قیمت‌ها:</span>
                        <span style="color: ${difference > 0.001 ? '#ff4444' : '#00ff88'}; font-weight: bold;">${percentageDiff}%</span>
                    </div>
                    <hr style="border: none; border-top: 1px solid rgba(255, 149, 0, 0.3); margin: 0.5rem 0;">
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #ccc;">قیمت ثبت‌نام (قرارداد):</span>
                        <span style="color: #a786ff; font-weight: bold;">${registrationPrice} LVL</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #ccc;">قیمت 0.1 دلار (محاسبه شده):</span>
                        <span style="color: #00ff88; font-weight: bold;">${tenCentsTokens} LVL</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #ccc;">قیمت 12 سنت (محاسبه شده):</span>
                        <span style="color: #ff6b6b; font-weight: bold;">${twelveCentsTokens} LVL</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #ccc;">تفاوت قیمت ثبت‌نام با 0.1 دلار:</span>
                        <span style="color: ${priceDifference > 1 ? '#ff4444' : '#00ff88'}; font-weight: bold;">${pricePercentageDiff}%</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #ccc;">تفاوت قیمت ثبت‌نام با 12 سنت:</span>
                        <span style="color: ${priceDifference12 > 1 ? '#ff4444' : '#00ff88'}; font-weight: bold;">${pricePercentageDiff12}%</span>
                    </div>
                </div>
                <div style="font-size: 0.8rem; color: #ccc; margin-top: 0.5rem;">
                    <strong>توضیح:</strong> قیمت دلاری از Chainlink و قیمت MATIC از نسبت موجودی قرارداد محاسبه می‌شود. 
                    قیمت ثبت‌نام ممکن است با قیمت محاسبه شده متفاوت باشد.
                </div>
            </div>
        `;
        comparisonContainer.innerHTML = comparisonHTML;
    }
} 