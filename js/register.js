// register.js - مدیریت بخش ثبت‌نام و ارتقا
let isRegisterLoading = false;
let registerDataLoaded = false;
let registerTabSelected = false;

document.addEventListener('DOMContentLoaded', function() {
    // Register section loaded, waiting for wallet connection...
});

// تابع بارگذاری اطلاعات ثبت‌نام
async function loadRegisterData(contract, address, tokenPriceUSDFormatted) {
    if (isRegisterLoading || registerDataLoaded) {
        // console.log('Register: Already loading or loaded, skipping...');
        return;
    }
    
    // فقط اگر تب register انتخاب شده باشد
    if (!registerTabSelected) {
        // console.log('Register: Tab not selected, skipping...');
        return;
    }
    
    isRegisterLoading = true;
    
    try {
        // console.log('Register: Loading register data...');
        
        // بررسی اتصال کیف پول
        if (!window.contractConfig || !window.contractConfig.contract) {
            // console.log('Register: No wallet connection, skipping...');
            return;
        }
        
        const { contract, address } = window.contractConfig;
        // console.log('Register: Wallet connected, loading register data...');
        
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
            // فقط فرم ارتقا را نمایش بده
            const profileContainer = document.querySelector('#main-register .profile-container');
            if (profileContainer) profileContainer.style.display = 'none';
            const upgradeForm = document.getElementById('upgrade-form');
            if (upgradeForm) upgradeForm.style.display = 'block';
            // غیرفعال کردن input معرف
            const refInput = document.getElementById('referrer-address');
            if (refInput) refInput.readOnly = true;
            await loadUpgradeData(contract, address, tokenPriceUSDFormatted);
            // نمایش دکمه ثبت جدید
            const newRegisterBtn = document.getElementById('new-register-btn');
            if (newRegisterBtn) newRegisterBtn.style.display = '';
        } else {
            // فقط فرم ثبت‌نام ساده را نمایش بده
            const profileContainer = document.querySelector('#main-register .profile-container');
            if (profileContainer) profileContainer.style.display = '';
            const upgradeForm = document.getElementById('upgrade-form');
            if (upgradeForm) upgradeForm.style.display = 'none';
            // فعال کردن input معرف
            const refInput = document.getElementById('referrer-address');
            if (refInput) refInput.readOnly = false;
            // مخفی کردن دکمه ثبت جدید
            const newRegisterBtn = document.getElementById('new-register-btn');
            if (newRegisterBtn) newRegisterBtn.style.display = 'none';
            await showRegistrationForm();
        }
        registerDataLoaded = true;
        // console.log('Register: Data loaded successfully');
        
    } catch (error) {
        // console.error('Error loading register data:', error);
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
        // console.error("Error loading upgrade data:", error);
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
                upgradeBtn.disabled = amount > userBalanceNum;
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
                // console.error("Registration error:", error);
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
                // console.error("Upgrade error:", error);
                showRegisterError("خطا در ارتقا");
            }
        };
    }
}

// تابع انجام ثبت‌نام
async function performRegistration() {
    try {
        if (!window.contractConfig || !window.contractConfig.contract) {
            throw new Error('No wallet connection');
        }
        const { contract, address } = window.contractConfig;
        // مقدار معرف را از input کاربر بگیر
        let referrerInput = document.getElementById('referrer-address');
        let referrerAddress = referrerInput && referrerInput.value ? referrerInput.value.trim() : '';
        // اگر مقدار وارد نشده بود، از URL یا localStorage بگیر
        if (!referrerAddress) {
            referrerAddress = getReferrerFromURL() || getReferrerFromStorage();
        }
        if (!referrerAddress) {
            referrerAddress = await contract.deployer();
        }
        // بررسی معتبر بودن معرف
        try {
            const referrerData = await contract.users(referrerAddress);
            if (!referrerData.activated) {
                throw new Error('Referrer is not activated');
            }
        } catch (error) {
            referrerAddress = await contract.deployer();
        }
        const regprice = await contract.regprice();
        const tx = await contract.registerAndActivate(referrerAddress, address, regprice);
        await tx.wait();
        showRegisterSuccess("ثبت‌نام با موفقیت انجام شد!");
        registerDataLoaded = false;
        setTimeout(() => {
            loadRegisterData(contract, address, tokenPriceUSDFormatted);
        }, 2000);
    } catch (error) {
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
            loadRegisterData(contract, address, tokenPriceUSDFormatted);
        }, 2000);
        
    } catch (error) {
        // console.error("Upgrade failed:", error);
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
async function showRegistrationForm() {
    const registrationForm = document.getElementById('registration-form');
    if (!registrationForm) return;
    registrationForm.style.display = 'block';

    // مقداردهی آدرس معرف: اولویت با لینک رفرال
    let referrer = getReferrerFromURL();
    if (!referrer) {
        // اگر در URL نبود، از userData یا deployer استفاده کن
        const { contract } = window.contractConfig;
        const userData = await contract.users(window.contractConfig.address);
        referrer = userData.referrer || (await contract.deployer());
    }
    const referrerInput = document.getElementById('referrer-address');
    if (referrerInput) referrerInput.value = referrer || '';

    // مقدار توکن مورد نیاز را از قرارداد بگیر
    let requiredTokenAmount = '';
    let userLvlBalance = '';
    try {
        const { contract, address } = window.contractConfig;
        const regprice = await contract.regprice();
        requiredTokenAmount = ethers.formatUnits(regprice, 18);
        const lvlBalance = await contract.balanceOf(address);
        userLvlBalance = ethers.formatUnits(lvlBalance, 18);
    } catch (e) {
        requiredTokenAmount = '-';
        userLvlBalance = '0';
    }
    const requiredTokenInput = document.getElementById('required-token-amount');
    if (requiredTokenInput) requiredTokenInput.value = requiredTokenAmount;

    // دکمه ثبت‌نام
    const registerBtn = document.getElementById('register-btn');
    const registerStatus = document.getElementById('register-status');
    if (registerBtn) {
        // فعال/غیرفعال کردن دکمه بر اساس موجودی
        if (parseFloat(userLvlBalance) < parseFloat(requiredTokenAmount)) {
            registerBtn.disabled = true;
            registerBtn.textContent = 'موجودی LVL کافی نیست';
            if (registerStatus) registerStatus.textContent = 'برای ثبت‌نام باید حداقل '+requiredTokenAmount+' LVL داشته باشید.';
        } else {
            registerBtn.disabled = false;
            registerBtn.textContent = 'ثبت‌ نام';
            if (registerStatus) registerStatus.textContent = '';
        }
        registerBtn.onclick = async function() {
            if (registerBtn.disabled) return;
            registerBtn.disabled = true;
            registerBtn.textContent = 'در حال ثبت‌نام...';
            try {
                await registerUser(referrer, requiredTokenAmount);
                registerStatus.textContent = 'ثبت‌نام با موفقیت انجام شد!';
            } catch (e) {
                registerStatus.textContent = 'خطا در ثبت‌نام: ' + (e.message || e);
            }
            registerBtn.disabled = false;
            registerBtn.textContent = 'ثبت‌ نام';
        };
    }
}

// تابع ثبت‌نام ساده
async function registerUser(referrer, requiredTokenAmount) {
    const { contract, address } = await window.connectWallet();
    if (!contract || !address) throw new Error('کیف پول متصل نیست');
    // تبدیل مقدار به wei (عدد صحیح)
    const amountInWei = ethers.parseUnits(requiredTokenAmount, 18);
    await contract.registerAndActivate(referrer, address, amountInWei);
}

// مدیریت نمایش فرم ثبت جدید و ثبت نفر جدید
window.addEventListener('DOMContentLoaded', function() {
    const newRegisterBtn = document.getElementById('new-register-btn');
    const newRegisterModal = document.getElementById('new-registration-modal');
    const closeNewRegister = document.getElementById('close-new-register');
    const submitNewRegister = document.getElementById('submit-new-register');
    if (newRegisterBtn && newRegisterModal && closeNewRegister && submitNewRegister) {
        newRegisterBtn.onclick = function() {
            newRegisterModal.style.display = 'flex';
        };
        closeNewRegister.onclick = function() {
            newRegisterModal.style.display = 'none';
            document.getElementById('new-user-address').value = '';
            document.getElementById('new-referrer-address').value = '';
            document.getElementById('new-register-status').textContent = '';
        };
        submitNewRegister.onclick = async function() {
            const userAddr = document.getElementById('new-user-address').value.trim();
            const refAddr = document.getElementById('new-referrer-address').value.trim();
            const statusDiv = document.getElementById('new-register-status');
            if (!userAddr || !refAddr) {
                statusDiv.textContent = 'آدرس نفر جدید و معرف را وارد کنید';
                statusDiv.className = 'profile-status error';
                return;
            }
            submitNewRegister.disabled = true;
            const oldText = submitNewRegister.textContent;
            submitNewRegister.textContent = 'در حال ثبت...';
            try {
                if (!window.contractConfig || !window.contractConfig.contract) throw new Error('اتصال کیف پول برقرار نیست');
                const { contract } = window.contractConfig;
                // بررسی معتبر بودن معرف
                const refData = await contract.users(refAddr);
                if (!refData.activated) throw new Error('معرف فعال نیست');
                // بررسی ثبت‌نام نبودن نفر جدید
                const userData = await contract.users(userAddr);
                if (userData.activated) throw new Error('این آدرس قبلاً ثبت‌نام کرده است');
                // دریافت قیمت ثبت‌نام
                const regprice = await contract.regprice();
                // ثبت‌نام نفر جدید (با ولت فعلی)
                const tx = await contract.registerAndActivate(refAddr, userAddr, regprice);
                await tx.wait();
                statusDiv.textContent = 'ثبت‌نام نفر جدید با موفقیت انجام شد!';
                statusDiv.className = 'profile-status success';
            } catch (e) {
                statusDiv.textContent = e.message || 'خطا در ثبت‌نام نفر جدید';
                statusDiv.className = 'profile-status error';
            }
            submitNewRegister.disabled = false;
            submitNewRegister.textContent = oldText;
        };
    }
});