// register.js - مدیریت بخش ثبت‌نام و ارتقا
let isRegisterLoading = false;
let registerDataLoaded = false;
let registerTabSelected = false;

document.addEventListener('DOMContentLoaded', function() {
    // Register section loaded, waiting for wallet connection...
});

// تابع دریافت و نمایش مقدار توکن مورد نیاز برای ثبت‌نام
window.updateRegisterRequiredAmount = function() {
    const el = document.getElementById('register-required-usdc') || document.getElementById('register-IAM-required');
    if (el) el.innerText = '100 IAM';
};

// تابع بارگذاری اطلاعات ثبت‌نام
async function loadRegisterData(contract, address, tokenPriceUSDFormatted) {
    if (isRegisterLoading || registerDataLoaded) {
        return;
    }
    
    // فقط اگر تب register انتخاب شده باشد
    if (!registerTabSelected) {
        return;
    }
    
    isRegisterLoading = true;
    
    try {
        
        // بررسی اتصال کیف پول
        if (!window.contractConfig || !window.contractConfig.contract) {
            return;
        }
        
        const { contract, address } = window.contractConfig;
        
        // دریافت اطلاعات کاربر
        const userData = await contract.users(address);
        
        // تغییر به USDC:
        const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
        const usdcBalance = await usdcContract.balanceOf(address);
        const usdcDecimals = await usdcContract.decimals();
        const usdcBalanceFormatted = ethers.formatUnits(usdcBalance, usdcDecimals);
        
        // دریافت قیمت‌ها و اطلاعات ثبت‌نام
        // Try to get registration price from contract, fallback to hardcoded value
        let regprice;
        try {
            // First try getRegPrice (new function)
            if (typeof contract.getRegPrice === 'function') {
                regprice = await contract.getRegPrice();
            }

        } catch (e) {
            regprice = ethers.parseUnits('100', 18);
        }
        
        const tokenPriceMatic = await contract.getTokenPrice(); // قیمت توکن بر حسب MATIC
        const tokenPriceFormatted = ethers.formatUnits(tokenPriceMatic, 18);
        // قیمت IAM/USDC (مستقیماً از قرارداد)
        const tokenPriceUSDFormatted = tokenPriceFormatted;
        const regpriceFormatted = ethers.formatUnits(regprice, 18); // مقدار توکن مورد نیاز
        const regpriceUSD = ethers.formatUnits(regprice, 8); // مقدار دلاری
        // محاسبه مقدار توکن برای مقادیر مختلف (USDC همیشه 1 دلار است)
        const oneCentTokens = 0.01 / parseFloat(tokenPriceFormatted);
        const oneCentTokensFormatted = oneCentTokens.toFixed(6);
        const tenCentsInTokens = 0.1 / parseFloat(tokenPriceFormatted);
        const tenCentsInTokensFormatted = tenCentsInTokens.toFixed(6);
        const twelveCentsInTokens = 0.12 / parseFloat(tokenPriceFormatted);
        const twelveCentsInTokensFormatted = twelveCentsInTokens.toFixed(6);
        // محاسبه ارزش دلاری موجودی
        const IAMBalanceUSD = (parseFloat(usdcBalanceFormatted) * parseFloat(tokenPriceUSDFormatted)).toFixed(2);
        // به‌روزرسانی نمایش موجودی‌ها
        await window.displayUserBalances();
        // بررسی وضعیت ثبت‌نام
        if (userData && userData.index && BigInt(userData.index) > 0n) {
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
            await showRegistrationFormForNewUser();
        }
        registerDataLoaded = true;
        
    } catch (error) {
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

// Export functions for global use
window.setRegisterTabSelected = setRegisterTabSelected;
window.updateRegisterRequiredAmount = function() {
    const el = document.getElementById('register-required-usdc') || document.getElementById('register-IAM-required');
    if (el) el.innerText = '100 IAM';
};

// تابع بارگذاری اطلاعات ارتقا
async function loadUpgradeData(contract, address, tokenPriceUSD) {
    try {
        const userData = await contract.users(address);
        const IAMBalance = await contract.balanceOf(address);
        const IAMBalanceFormatted = ethers.formatUnits(IAMBalance, 18);
        
        // به‌روزرسانی محاسبات ارتقا
        updateUpgradeCalculations(IAMBalanceFormatted, tokenPriceUSD, userData.binaryPointCap);
        
    } catch (error) {
        // console.error("Error loading upgrade data:", error);
    }
}

// تابع به‌روزرسانی محاسبات ارتقا
    function updateUpgradeCalculations(IAMBalance, tokenPriceUSD, currentCap) {
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
                const userBalanceNum = parseFloat(IAMBalance);
                upgradeBtn.disabled = amount > userBalanceNum;
            }
        });
    }
}

// تابع راه‌اندازی دکمه ثبت‌نام
function setupRegistrationButton() {
    const registerBtn = document.getElementById('register-btn');
    const registerStatus = document.getElementById('register-status');
    if (registerBtn) {
        registerBtn.onclick = async () => {
            const oldText = registerBtn.textContent;
            registerBtn.disabled = true;
            registerBtn.innerHTML = '<span class="spinner" style="display:inline-block;width:18px;height:18px;border:2px solid #fff;border-top:2px solid #00ff88;border-radius:50%;margin-left:8px;vertical-align:middle;animation:spin 0.8s linear infinite;"></span> در حال ثبت‌نام...';
            if (registerStatus) registerStatus.textContent = '';
            try {
                await performRegistration();
                if (registerStatus) registerStatus.textContent = '✅ ثبت‌نام با موفقیت انجام شد!';
                registerBtn.style.display = 'none';
            } catch (error) {
                let msg = error && error.message ? error.message : error;
                if (error.code === 4001 || msg.includes('user denied')) {
                    msg = '❌ تراکنش توسط کاربر لغو شد.';
                } else if (error.code === -32002 || msg.includes('Already processing')) {
                    msg = '⏳ متامسک در حال پردازش درخواست قبلی است. لطفاً چند لحظه صبر کنید.';
                } else if (error.code === 'NETWORK_ERROR' || msg.includes('network')) {
                    msg = '❌ خطای شبکه! اتصال اینترنت یا شبکه بلاکچین را بررسی کنید.';
                } else if (msg.includes('insufficient funds')) {
                    msg = 'موجودی کافی برای پرداخت کارمزد یا ثبت‌نام وجود ندارد.';
                } else if (msg.includes('invalid address')) {
                    msg = 'آدرس معرف یا مقصد نامعتبر است.';
                } else if (msg.includes('not allowed') || msg.includes('only owner')) {
                    msg = 'شما مجاز به انجام این عملیات نیستید.';
                } else if (msg.includes('already registered') || msg.includes('already exists')) {
                    msg = 'شما قبلاً ثبت‌نام کرده‌اید یا این آدرس قبلاً ثبت شده است.';
                } else if (msg.includes('execution reverted')) {
                    msg = 'تراکنش ناموفق بود. شرایط ثبت‌نام را بررسی کنید.';
                } else {
                    msg = '❌ خطا در ثبت‌نام: ' + (msg || 'خطای ناشناخته');
                }
                if (registerStatus) registerStatus.textContent = msg;
            } finally {
                registerBtn.disabled = false;
                registerBtn.textContent = oldText;
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

// تابع انجام ثبت‌نام برای کاربر جدید (کیف پول متصل)
async function performRegistrationForNewUser() {
    try {
        if (!window.contractConfig || !window.contractConfig.contract) {
            throw new Error('اتصال کیف پول برقرار نیست');
        }
        const { contract, address } = window.contractConfig;
        
        // معرف به‌صورت پیش‌فرض: از فیلد ورودی دریافت کن
        const referrerInput = document.getElementById('referrer-address');
        const referrerAddress = referrerInput && referrerInput.value ? referrerInput.value.trim() : '';
        if (!referrerAddress) {
            throw new Error('لطفاً آدرس معرف را وارد کنید');
        }
        
        // کاربر جدید: کیف پول متصل
        const userAddress = address;

        // منطق approve قبل از ثبت‌نام:
        const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, window.contractConfig.signer);
        const allowance = await usdcContract.allowance(address, CONTRACT_ADDRESS);
        if (allowance < regprice) {
          const approveTx = await usdcContract.approve(CONTRACT_ADDRESS, regprice);
          await approveTx.wait();
        }
        
        const tx = await contract.registerAndActivate(referrerAddress, userAddress);
        await tx.wait();
        showRegisterSuccess("ثبت‌نام با موفقیت انجام شد!");
        
        // مخفی کردن دکمه ثبت‌نام اصلی
        if (typeof window.hideMainRegistrationButton === 'function') {
            window.hideMainRegistrationButton();
        }
        
        registerDataLoaded = false;
        setTimeout(() => {
            loadRegisterData(contract, address, tokenPriceUSDFormatted);
        }, 2000);
    } catch (error) {
        showRegisterError(error.message || 'خطا در ثبت‌نام.');
    }
}

// تابع انجام ثبت‌نام
async function performRegistration() {
    try {
        if (!window.contractConfig || !window.contractConfig.contract) {
            throw new Error('اتصال کیف پول برقرار نیست');
        }
        const { contract, address } = window.contractConfig;
        
        // بررسی وضعیت کاربر فعلی
        const currentUserData = await contract.users(address);
        
        if (currentUserData && currentUserData.index && BigInt(currentUserData.index) > 0n) {
            // کاربر ثبت‌نام شده است - فقط می‌تواند زیرمجموعه ثبت‌نام کند
            const userAddressInput = document.getElementById('register-user-address') || document.getElementById('new-user-address');
            const userAddress = userAddressInput ? userAddressInput.value.trim() : '';
            
            if (!userAddress || !/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
                throw new Error('آدرس کاربر جدید معتبر نیست');
            }
            
            // معرف: آدرس کاربر فعلی
            const referrerAddress = address;
            
            // بررسی ثبت‌نام نبودن کاربر جدید
            const newUserData = await contract.users(userAddress);
            if (newUserData && newUserData.index && BigInt(newUserData.index) > 0n) {
                throw new Error('این آدرس قبلاً ثبت‌نام کرده است');
            }
            
            // منطق approve قبل از ثبت‌نام:
            const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, window.contractConfig.signer);
            const allowance = await usdcContract.allowance(address, CONTRACT_ADDRESS);
            if (allowance < regprice) {
              const approveTx = await usdcContract.approve(CONTRACT_ADDRESS, regprice);
              await approveTx.wait();
            }
            
            const tx = await contract.registerAndActivate(referrerAddress, userAddress);
            await tx.wait();
            showRegisterSuccess("ثبت‌نام زیرمجموعه با موفقیت انجام شد!");
        } else {
            // کاربر ثبت‌نام نشده است - حالت دستی
            let referrerInput = document.getElementById('referrer-address');
            let referrerAddress = referrerInput && referrerInput.value ? referrerInput.value.trim() : '';
            if (!referrerAddress) {
                referrerAddress = getReferrerFromURL() || getReferrerFromStorage();
            }
            if (!referrerAddress) {
                throw new Error('لطفاً آدرس معرف را وارد کنید');
            }

            // منطق approve قبل از ثبت‌نام:
            const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, window.contractConfig.signer);
            const allowance = await usdcContract.allowance(address, CONTRACT_ADDRESS);
            if (allowance < regprice) {
              const approveTx = await usdcContract.approve(CONTRACT_ADDRESS, regprice);
              await approveTx.wait();
            }
            const tx = await contract.registerAndActivate(referrerAddress, address);
            await tx.wait();
            showRegisterSuccess("ثبت‌نام با موفقیت انجام شد!");
        }
        
        // مخفی کردن دکمه ثبت‌نام اصلی
        if (typeof window.hideMainRegistrationButton === 'function') {
            window.hideMainRegistrationButton();
        }
        
        registerDataLoaded = false;
        setTimeout(() => {
            loadRegisterData(contract, address, tokenPriceUSDFormatted);
        }, 2000);
    } catch (error) {
        showRegisterError(error.message || 'خطا در ثبت‌نام.');
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
    showMessageBox(message || 'ثبت‌نام با موفقیت انجام شد! به جمع کاربران ما خوش آمدید.', 'success');
}

// تابع نمایش پیام خطا
function showRegisterError(message) {
    showMessageBox(message || 'خطا در ثبت‌نام. لطفاً مجدداً تلاش کنید یا با پشتیبانی تماس بگیرید.', 'error');
}

// تابع نمایش پیام‌های عمومی
function showMessageBox(message, type = 'info') {
    // حذف message box قبلی اگر وجود دارد
    const existingBox = document.getElementById('message-box');
    if (existingBox) {
        existingBox.remove();
    }
    
    // ایجاد message box جدید
    const messageBox = document.createElement('div');
    messageBox.id = 'message-box';
    messageBox.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${type === 'error' ? 'rgba(255, 0, 0, 0.95)' : type === 'success' ? 'rgba(0, 255, 136, 0.95)' : 'rgba(167, 134, 255, 0.95)'};
        color: white;
        padding: 20px 30px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        max-width: 400px;
        text-align: center;
        font-size: 14px;
        line-height: 1.5;
        backdrop-filter: blur(10px);
        border: 1px solid ${type === 'error' ? 'rgba(255, 0, 0, 0.3)' : type === 'success' ? 'rgba(0, 255, 136, 0.3)' : 'rgba(167, 134, 255, 0.3)'};
    `;
    
    // آیکون بر اساس نوع پیام
    const icon = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    
    messageBox.innerHTML = `
        <div style="margin-bottom: 10px; font-size: 24px;">${icon}</div>
        <div style="margin-bottom: 15px;">${message}</div>
        <button onclick="this.parentElement.remove()" style="
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 8px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            transition: all 0.3s ease;
        " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
            بستن
        </button>
    `;
    
    document.body.appendChild(messageBox);
    
    // حذف خودکار بعد از 5 ثانیه
    setTimeout(() => {
        if (messageBox.parentElement) {
            messageBox.remove();
        }
    }, 5000);
}

// تابع نمایش پیام‌های موقت (برای validation)
function showTempMessage(message, type = 'info', duration = 3000) {
    const tempBox = document.createElement('div');
    tempBox.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? 'rgba(255, 0, 0, 0.9)' : type === 'success' ? 'rgba(0, 255, 136, 0.9)' : 'rgba(167, 134, 255, 0.9)'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        font-size: 13px;
        max-width: 300px;
        backdrop-filter: blur(8px);
        border: 1px solid ${type === 'error' ? 'rgba(255, 0, 0, 0.3)' : type === 'success' ? 'rgba(0, 255, 136, 0.3)' : 'rgba(167, 134, 255, 0.3)'};
        animation: slideIn 0.3s ease;
    `;
    
    const icon = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    tempBox.innerHTML = `${icon} ${message}`;
    
    document.body.appendChild(tempBox);
    
    setTimeout(() => {
        if (tempBox.parentElement) {
            tempBox.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => tempBox.remove(), 300);
        }
    }, duration);
}

// اضافه کردن CSS animations
if (!document.getElementById('message-box-styles')) {
    const style = document.createElement('style');
    style.id = 'message-box-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// تابع به‌روزرسانی نمایش موجودی
function updateBalanceDisplay(IAMBalance, IAMBalanceUSD) {
    const lvlBalanceElement = document.getElementById('user-lvl-balance');
    const lvlUsdElement = document.getElementById('user-lvl-usd-value');
    
    if (lvlBalanceElement) {
        lvlBalanceElement.textContent = `${parseFloat(IAMBalance).toFixed(2)} USDC`;
    }
    
    if (lvlUsdElement) {
        lvlUsdElement.textContent = `$${IAMBalanceUSD} USD`;
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
                        <span style="color: #00ff88; font-weight: bold;">${registrationPrice} USDC</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #ccc;">ارزش دلاری (هدف قرارداد):</span>
                        <span style="color: #00ccff; font-weight: bold;">$0.01 USD</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #ccc;">Current Token Price (USD):</span>
                        <span style="color: #ffffff; font-weight: bold;">$${tokenPriceUSD} USD</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #ccc;">Current Token Price (MATIC):</span>
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

// تابع نمایش فرم ثبت‌نام برای کاربر جدید (کیف پول متصل)
window.showRegistrationFormForNewUser = async function() {
    const registrationForm = document.getElementById('registration-form');
    if (!registrationForm) return;
    registrationForm.style.display = 'block';

    // دریافت و نمایش مقدار توکن مورد نیاز برای ثبت‌نام
    await window.displayUserBalances();

    // تنظیم معرف به‌صورت پیش‌فرض: آدرس خالی (کاربر باید دستی وارد کند)
    let referrer = '';
    
    // تنظیم آدرس کاربر جدید به کیف پول متصل
    const userAddress = window.contractConfig.address;
    
    // پر کردن فیلدهای فرم
    const referrerInput = document.getElementById('referrer-address');
    const userAddressInput = document.getElementById('register-user-address') || document.getElementById('new-user-address');
    
    if (referrerInput) {
        referrerInput.value = referrer;
        referrerInput.readOnly = false; // فعال کردن تغییر معرف
    }
    
    if (userAddressInput) {
        userAddressInput.value = userAddress;
        userAddressInput.readOnly = true; // غیرفعال کردن تغییر آدرس کاربر
    }
    
    // نمایش پیام راهنما
    const statusElement = document.getElementById('register-status');
    if (statusElement) {
        statusElement.innerHTML = `
            <div style="background: rgba(255,193,7,0.1); border: 1px solid rgba(255,193,7,0.3); border-radius: 8px; padding: 12px; margin: 10px 0;">
                <strong style="color: #ffc107;">📝 ثبت‌نام دستی:</strong><br>
                • لطفاً آدرس معرف را وارد کنید<br>
                • کاربر جدید: <span style="color: #a786ff;">${userAddress}</span><br>
                • پس از وارد کردن آدرس معرف، روی دکمه "ثبت‌نام" کلیک کنید
            </div>
        `;
        statusElement.className = 'profile-status info';
    }

    // تنظیم دکمه ثبت‌نام
    const registerBtn = document.getElementById('register-btn');
    if (registerBtn) {
        registerBtn.onclick = async () => {
            const oldText = registerBtn.textContent;
            registerBtn.disabled = true;
            registerBtn.innerHTML = '<span class="spinner" style="display:inline-block;width:18px;height:18px;border:2px solid #fff;border-top:2px solid #00ff88;border-radius:50%;margin-left:8px;vertical-align:middle;animation:spin 0.8s linear infinite;"></span> در حال ثبت‌نام...';
            
            try {
                await performRegistrationForNewUser();
                if (statusElement) {
                    statusElement.textContent = '✅ ثبت‌نام با موفقیت انجام شد!';
                    statusElement.className = 'profile-status success';
                }
                registerBtn.style.display = 'none';
            } catch (error) {
                let msg = error && error.message ? error.message : error;
                if (error.code === 4001 || msg.includes('user denied')) {
                    msg = '❌ تراکنش توسط کاربر لغو شد.';
                } else if (error.code === -32002 || msg.includes('Already processing')) {
                    msg = '⏳ متامسک در حال پردازش درخواست قبلی است. لطفاً چند لحظه صبر کنید.';
                } else if (error.code === 'NETWORK_ERROR' || msg.includes('network')) {
                    msg = '❌ خطای شبکه! اتصال اینترنت یا شبکه بلاکچین را بررسی کنید.';
                } else if (msg.includes('insufficient funds')) {
                    msg = '❌ موجودی کافی نیست! موجودی IAM یا MATIC خود را بررسی کنید.';
                }
                
                if (statusElement) {
                    statusElement.textContent = msg;
                    statusElement.className = 'profile-status error';
                }
                registerBtn.disabled = false;
                registerBtn.textContent = oldText;
            }
        };
    }
};

// تابع نمایش فرم ثبت‌نام
window.showRegistrationForm = async function() {
    const registrationForm = document.getElementById('registration-form');
    if (!registrationForm) return;
    registrationForm.style.display = 'block';

    // دریافت و نمایش مقدار توکن مورد نیاز برای ثبت‌نام
    // await updateRegisterRequiredAmount(); // Disabled infinite fetch
    
    // نمایش موجودی‌های کاربر
    await window.displayUserBalances();

    // برای کاربران ثبت‌نام شده: فقط امکان ثبت‌نام زیرمجموعه‌های خودشان
    const { contract, address } = window.contractConfig;
    const currentUserData = await contract.users(address);
    
    if (currentUserData && currentUserData.index && BigInt(currentUserData.index) > 0n) {
        // کاربر ثبت‌نام شده است - فقط می‌تواند زیرمجموعه ثبت‌نام کند
        const refInputGroup = document.getElementById('register-ref-input-group');
        const refSummary = document.getElementById('register-ref-summary');
        const walletAddressSpan = document.getElementById('register-wallet-address');
        const referrerAddressSpan = document.getElementById('register-referrer-address');
        
        // معرف به‌صورت پیش‌فرض: آدرس کاربر فعلی
        const referrer = address;
        const referrerInput = document.getElementById('referrer-address');
        if (referrerInput) {
            referrerInput.value = referrer;
            referrerInput.readOnly = true; // غیرفعال کردن تغییر معرف
        }
        
        // نمایش پیام راهنما
        const statusElement = document.getElementById('register-status');
        if (statusElement) {
            statusElement.innerHTML = `
                <div style="background: rgba(167,134,255,0.1); border: 1px solid rgba(167,134,255,0.3); border-radius: 8px; padding: 12px; margin: 10px 0;">
                    <strong style="color: #a786ff;">👥 ثبت‌نام زیرمجموعه:</strong><br>
                    • معرف: <span style="color: #a786ff;">${referrer}</span> (شما)<br>
                    • آدرس کاربر جدید را وارد کنید<br>
                    • فقط می‌توانید برای زیرمجموعه‌های خود ثبت‌نام کنید
                </div>
            `;
            statusElement.className = 'profile-status info';
        }
        
        // مخفی کردن فیلد معرف و نمایش خلاصه
        if (refInputGroup) refInputGroup.style.display = 'none';
        if (refSummary) {
            refSummary.style.display = 'block';
            if (walletAddressSpan) walletAddressSpan.textContent = address;
            if (referrerAddressSpan) referrerAddressSpan.textContent = referrer;
        }
    } else {
        // کاربر ثبت‌نام نشده است - حالت عادی
        let referrer = getReferrerFromURL();
        const refInputGroup = document.getElementById('register-ref-input-group');
        const refSummary = document.getElementById('register-ref-summary');
        const walletAddressSpan = document.getElementById('register-wallet-address');
        const referrerAddressSpan = document.getElementById('register-referrer-address');
        let isReferralMode = false;
        if (!referrer) {
            // اگر در URL نبود، فیلد خالی بگذار (کاربر باید دستی وارد کند)
            referrer = '';
        } else {
            // اگر رفرر در URL بود، حالت رفرال فعال شود
            isReferralMode = true;
        }
        const referrerInput = document.getElementById('referrer-address');
        if (referrerInput) referrerInput.value = referrer || '';

        // اگر حالت رفرال است، ورودی را مخفی و خلاصه را نمایش بده
        if (isReferralMode) {
            if (refInputGroup) refInputGroup.style.display = 'none';
            if (refSummary) {
                refSummary.style.display = 'block';
                if (walletAddressSpan) walletAddressSpan.textContent = window.contractConfig.address;
                if (referrerAddressSpan) referrerAddressSpan.textContent = referrer;
            }
                 } else {
             if (refInputGroup) refInputGroup.style.display = 'block';
             if (refSummary) refSummary.style.display = 'none';
         }
     }


    // نمایش موجودی‌های کاربر
    await window.displayUserBalances();
    
    // نمایش مقدار مورد نیاز
    const IAMRequiredSpan = document.getElementById('register-IAM-required');
    if (IAMRequiredSpan) IAMRequiredSpan.textContent = regPrice; // Static value

    // 1. Add logic to fetch MATIC balance and required MATIC for registration
    async function fetchMaticBalance(address, contract) {
      try {
        const maticWei = await contract.provider.getBalance(address);
        return ethers.formatEther(maticWei);
      } catch (e) {
        return '0';
      }
    }

    // 2. Update registration form logic to show MATIC balance and required MATIC
    // (Find the main registration form logic and add after IAM balance logic)

    // Set required MATIC (for registration, e.g. 0.05 MATIC for gas)
    const requiredMatic = 0.05; // You can adjust this value as needed
    const maticRequiredSpan = document.getElementById('register-matic-required');
    if (maticRequiredSpan) maticRequiredSpan.textContent = requiredMatic + ' MATIC';

    // 3. Update register button logic to check both IAM and MATIC balance
    const registerBtn = document.getElementById('register-btn');
    const registerStatus = document.getElementById('register-status');
    if (registerBtn) {
      // Get user address from input (not just connected wallet)
      const userAddressInput = document.getElementById('register-user-address');
      let targetUserAddress = userAddressInput ? userAddressInput.value.trim() : '';
      const referrerInput = document.getElementById('referrer-address');
      let referrer = referrerInput ? referrerInput.value.trim() : '';

      if (!/^0x[a-fA-F0-9]{40}$/.test(targetUserAddress)) {
        showTempMessage('آدرس کیف پول کاربر جدید معتبر نیست.', 'error');
        registerBtn.disabled = false;
        registerBtn.textContent = 'ثبت‌ نام';
        return;
      }
      if (!/^0x[a-fA-F0-9]{40}$/.test(referrer)) {
        showTempMessage('آدرس معرف معتبر نیست.', 'error');
        registerBtn.disabled = false;
        registerBtn.textContent = 'ثبت‌ نام';
        return;
      }
      // بررسی ثبت‌نام نبودن کاربر جدید
      let userData;
      try {
        userData = await contract.users(targetUserAddress);
      } catch (e) { userData = null; }
      if (userData && userData.index && BigInt(userData.index) > 0n) {
        showTempMessage('این آدرس قبلاً ثبت‌نام کرده است.', 'error');
        registerBtn.disabled = false;
        registerBtn.textContent = 'ثبت‌ نام';
        return;
      }
      // بررسی فعال بودن رفرر
      let refData;
      try {
        refData = await contract.users(referrer);
      } catch (e) { refData = null; }
      if (!refData || !(refData.index && BigInt(refData.index) > 0n)) {
        showTempMessage('معرف فعال نیست.', 'error');
        registerBtn.disabled = false;
        registerBtn.textContent = 'ثبت‌ نام';
        return;
      }
      // بررسی موجودی ولت متصل (address)
      if (parseFloat(userLvlBalance) < parseFloat(requiredTokenAmount)) {
        registerBtn.disabled = true;
        registerBtn.textContent = 'موجودی IAM کافی نیست';
        showTempMessage('موجودی توکن IAM شما برای ثبت‌نام کافی نیست. برای ثبت‌نام باید حداقل '+requiredTokenAmount+' IAM داشته باشید. لطفاً ابتدا کیف پول خود را شارژ یا از بخش سواپ/فروشگاه توکن IAM تهیه کنید.', 'error');
        return;
      } else if (parseFloat(maticBalance) < requiredMatic) {
        registerBtn.disabled = true;
        registerBtn.textContent = 'موجودی متیک کافی نیست';
        showTempMessage('برای ثبت‌نام باید حداقل '+requiredMatic+' MATIC در کیف پول خود داشته باشید.', 'error');
        return;
      }
      // ثبت‌نام
      registerBtn.disabled = true;
      registerBtn.textContent = 'در حال ثبت‌نام...';
      try {
        await contract.registerAndActivate(referrer, targetUserAddress);
        showRegisterSuccess('ثبت‌نام با موفقیت انجام شد!');
        registerBtn.style.display = 'none';
      } catch (e) {
        if (e.code === 4001) {
          showTempMessage('فرآیند ثبت‌نام توسط شما لغو شد.', 'error');
        } else {
          showRegisterError('خطا در ثبت‌نام: ' + (e.message || e));
        }
        registerBtn.disabled = false;
        registerBtn.textContent = 'ثبت‌ نام';
      }
    }

    // دکمه ثبت‌نام
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
            // Hide any duplicate or leftover registration forms
            const allModals = document.querySelectorAll('.new-registration-modal, #new-registration-modal');
            allModals.forEach(m => m.style.display = 'none');
        };
        submitNewRegister.onclick = async function() {
            const userAddr = document.getElementById('new-user-address').value.trim();
            const refAddr = document.getElementById('new-referrer-address').value.trim();
            const statusDiv = document.getElementById('new-register-status');
            if (!userAddr || !refAddr) {
                showTempMessage('آدرس نفر جدید و معرف را وارد کنید', 'error');
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
                if (!(refData && refData.index && BigInt(refData.index) > 0n)) throw new Error('معرف فعال نیست');
                // بررسی ثبت‌نام نبودن نفر جدید
                const userData = await contract.users(userAddr);
                if (userData && userData.index && BigInt(userData.index) > 0n) throw new Error('این آدرس قبلاً ثبت‌نام کرده است');
                // ثبت‌نام نفر جدید (با ولت فعلی)
                const tx = await contract.registerAndActivate(refAddr, userAddr);
                await tx.wait();
                showRegisterSuccess('ثبت‌نام نفر جدید با موفقیت انجام شد!');
                setTimeout(() => location.reload(), 1200);
            } catch (e) {
                showRegisterError(e.message || 'خطا در ثبت‌نام نفر جدید');
            }
            submitNewRegister.disabled = false;
            submitNewRegister.textContent = oldText;
        };
    }
}

// تابع ثبت‌نام ساده
async function registerUser(referrer, requiredTokenAmount, targetUserAddress) {
    const { contract, address } = await window.connectWallet();
    if (!contract || !address) throw new Error('کیف پول متصل نیست');
    // تبدیل مقدار به wei (عدد صحیح)
    const amountInWei = ethers.parseUnits(requiredTokenAmount, 18);
    await contract.registerAndActivate(referrer, targetUserAddress);
}

// مدیریت نمایش فرم ثبت جدید و ثبت نفر جدید
window.addEventListener('DOMContentLoaded', function() {
    // راه‌اندازی دکمه ثبت‌نام اصلی
    setupRegistrationButton();
    setupUpgradeForm();
    
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
            // Hide any duplicate or leftover registration forms
            const allModals = document.querySelectorAll('.new-registration-modal, #new-registration-modal');
            allModals.forEach(m => m.style.display = 'none');
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
                if (!(refData && refData.index && BigInt(refData.index) > 0n)) throw new Error('معرف فعال نیست');
                // بررسی ثبت‌نام نبودن نفر جدید
                const userData = await contract.users(userAddr);
                if (userData && userData.index && BigInt(userData.index) > 0n) throw new Error('این آدرس قبلاً ثبت‌نام کرده است');
                // ثبت‌نام نفر جدید (با ولت فعلی)
                const tx = await contract.registerAndActivate(refAddr, userAddr);
                await tx.wait();
                statusDiv.textContent = 'ثبت‌نام نفر جدید با موفقیت انجام شد!';
                statusDiv.className = 'profile-status success';
                setTimeout(() => location.reload(), 1200);
            } catch (e) {
                statusDiv.textContent = e.message || 'خطا در ثبت‌نام نفر جدید';
                statusDiv.className = 'profile-status error';
            }
            submitNewRegister.disabled = false;
            submitNewRegister.textContent = oldText;
        };
    }
});

// ثبت‌نام نفر جدید با رفرر دلخواه (برای استفاده در شبکه)
window.registerNewUserWithReferrer = async function(referrer, newUserAddress, statusElement) {
    if (!window.contractConfig || !window.contractConfig.contract) {
        if (statusElement) {
            statusElement.textContent = 'اتصال کیف پول برقرار نیست';
            statusElement.className = 'profile-status error';
        }
        return;
    }
    const { contract } = window.contractConfig;
    if (!referrer || !newUserAddress) {
        if (statusElement) {
            statusElement.textContent = 'آدرس رفرر و آدرس نفر جدید الزامی است';
            statusElement.className = 'profile-status error';
        }
        return;
    }
    if (statusElement) {
        statusElement.textContent = 'در حال ثبت‌نام...';
        statusElement.className = 'profile-status info';
    }
    try {
        // بررسی فعال بودن رفرر
        const refData = await contract.users(referrer);
        if (!(refData && refData.index && BigInt(refData.index) > 0n)) throw new Error('معرف فعال نیست');
        // بررسی ثبت‌نام نبودن نفر جدید
        const userData = await contract.users(newUserAddress);
        if (userData && userData.index && BigInt(userData.index) > 0n) throw new Error('این آدرس قبلاً ثبت‌نام کرده است');
        // ثبت‌نام نفر جدید (با ولت فعلی)
        const tx = await contract.registerAndActivate(referrer, newUserAddress);
        await tx.wait();
        
        // مخفی کردن دکمه ثبت‌نام اصلی
        if (typeof window.hideMainRegistrationButton === 'function') {
            window.hideMainRegistrationButton();
        }
        
        if (statusElement) {
            statusElement.textContent = 'ثبت‌نام نفر جدید با موفقیت انجام شد!';
            statusElement.className = 'profile-status success';
            setTimeout(() => location.reload(), 1200);
        }
    } catch (e) {
        if (statusElement) {
            statusElement.textContent = e.message || 'خطا در ثبت‌نام نفر جدید';
            statusElement.className = 'profile-status error';
        }
    }
};
window.loadRegisterData = loadRegisterData;

// تابع نمایش موجودی‌های کاربر
async function displayUserBalances() {
    try {
        const { contract, address } = await window.connectWallet();
        // مقداردهی robust برای provider
        const provider =
            (contract && contract.provider) ||
            (window.contractConfig && window.contractConfig.provider) ||
            (window.ethereum ? new ethers.BrowserProvider(window.ethereum) : null);
        if (!provider) throw new Error('No provider available for getBalance');

        // دریافت موجودی‌های مختلف
        const [IAMBalance, usdcBalance, maticBalance] = await Promise.all([
            contract.balanceOf(address),
            (function() {
                const USDC_ADDRESS = window.USDC_ADDRESS || '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
                const USDC_ABI = window.USDC_ABI || ["function balanceOf(address) view returns (uint256)"];
                const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
                return usdcContract.balanceOf(address);
            })(),
            provider.getBalance(address)
        ]);
        
        // فرمت کردن موجودی‌ها
        const IAMFormatted = parseFloat(ethers.formatUnits(IAMBalance, 18)).toFixed(4);
        const usdcFormatted = parseFloat(ethers.formatUnits(usdcBalance, 6)).toFixed(2);
        const maticFormatted = parseFloat(ethers.formatEther(maticBalance)).toFixed(4);
        
        // به‌روزرسانی المنت‌های موجودی
        const balanceElements = {
            'user-IAM-balance': `${IAMFormatted} IAM`,
            'user-usdc-balance': `${usdcFormatted} USDC`,
            'user-matic-balance': `${maticFormatted} MATIC`,
            'register-IAM-balance': `${IAMFormatted} IAM`,
            'register-usdc-balance': `${usdcFormatted} USDC`,
            'register-matic-balance': `${maticFormatted} MATIC`
        };
        
        // به‌روزرسانی همه المنت‌های موجود
        Object.entries(balanceElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                // Updated element
            }
        });
        
        if (balances) {
            // User balances displayed successfully
        }
        
    } catch (error) {
        console.error('❌ Error displaying user balances:', error);
        return null;
    }
}

// Export for global use
window.displayUserBalances = displayUserBalances;

// Add spinner animation CSS to the page if not present
if (!document.getElementById('register-spinner-style')) {
  const style = document.createElement('style');
  style.id = 'register-spinner-style';
  style.innerHTML = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
  document.head.appendChild(style);
}

