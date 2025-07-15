// register.js - مدیریت بخش ثبت‌نام و ارتقا
let isRegisterLoading = false;
let registerDataLoaded = false;
let registerTabSelected = false;

document.addEventListener('DOMContentLoaded', function() {
    // Register section loaded, waiting for wallet connection...
});

// تابع دریافت و نمایش مقدار توکن مورد نیاز برای ثبت‌نام
window.updateRegisterRequiredAmount = function() {
    const el = document.getElementById('register-required-usdc') || document.getElementById('register-cpa-required');
    if (el) el.innerText = '100 CPA';
};

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
        // قیمت CPA/USDC (مستقیماً از قرارداد)
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
        const cpaBalanceUSD = (parseFloat(usdcBalanceFormatted) * parseFloat(tokenPriceUSDFormatted)).toFixed(2);
        // به‌روزرسانی نمایش موجودی‌ها
        await window.displayUserBalances();
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

// Export functions for global use
window.setRegisterTabSelected = setRegisterTabSelected;
window.updateRegisterRequiredAmount = function() {
    const el = document.getElementById('register-required-usdc') || document.getElementById('register-cpa-required');
    if (el) el.innerText = '100 CPA';
};

// تابع بارگذاری اطلاعات ارتقا
async function loadUpgradeData(contract, address, tokenPriceUSD) {
    try {
        const userData = await contract.users(address);
        const cpaBalance = await contract.balanceOf(address);
        const cpaBalanceFormatted = ethers.formatUnits(cpaBalance, 18);
        
        // به‌روزرسانی محاسبات ارتقا
        updateUpgradeCalculations(cpaBalanceFormatted, tokenPriceUSD, userData.binaryPointCap);
        
    } catch (error) {
        // console.error("Error loading upgrade data:", error);
    }
}

// تابع به‌روزرسانی محاسبات ارتقا
    function updateUpgradeCalculations(cpaBalance, tokenPriceUSD, currentCap) {
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
                const userBalanceNum = parseFloat(cpaBalance);
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
            registerBtn.textContent = 'در حال ثبت‌نام...';
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

// تابع انجام ثبت‌نام
async function performRegistration() {
    try {
        if (!window.contractConfig || !window.contractConfig.contract) {
            throw new Error('اتصال کیف پول برقرار نیست');
        }
        const { contract, address } = window.contractConfig;
        // مقدار معرف را از input یا URL یا localStorage بگیر
        let referrerInput = document.getElementById('referrer-address');
        let referrerAddress = referrerInput && referrerInput.value ? referrerInput.value.trim() : '';
        if (!referrerAddress) {
            referrerAddress = getReferrerFromURL() || getReferrerFromStorage();
        }
        if (!referrerAddress) {
            referrerAddress = await contract.deployer();
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
    const statusElement = document.getElementById('register-status');
    if (statusElement) {
        statusElement.textContent = message || 'ثبت‌نام با موفقیت انجام شد! به جمع کاربران ما خوش آمدید.';
        statusElement.className = 'profile-status success';
    }
}

// تابع نمایش پیام خطا
function showRegisterError(message) {
    const statusElement = document.getElementById('register-status');
    if (statusElement) {
        statusElement.textContent = message || 'خطا در ثبت‌نام. لطفاً مجدداً تلاش کنید یا با پشتیبانی تماس بگیرید.';
        statusElement.className = 'profile-status error';
    }
}

// تابع به‌روزرسانی نمایش موجودی
function updateBalanceDisplay(cpaBalance, cpaBalanceUSD) {
    const lvlBalanceElement = document.getElementById('user-lvl-balance');
    const lvlUsdElement = document.getElementById('user-lvl-usd-value');
    
    if (lvlBalanceElement) {
        lvlBalanceElement.textContent = `${parseFloat(cpaBalance).toFixed(2)} USDC`;
    }
    
    if (lvlUsdElement) {
        lvlUsdElement.textContent = `$${cpaBalanceUSD} USD`;
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

    // دریافت و نمایش مقدار توکن مورد نیاز برای ثبت‌نام
    // await updateRegisterRequiredAmount(); // Disabled infinite fetch
    
    // نمایش موجودی‌های کاربر
    await window.displayUserBalances();

    // مقداردهی آدرس معرف: اولویت با لینک رفرال
    let referrer = getReferrerFromURL();
    const refInputGroup = document.getElementById('register-ref-input-group');
    const refSummary = document.getElementById('register-ref-summary');
    const walletAddressSpan = document.getElementById('register-wallet-address');
    const referrerAddressSpan = document.getElementById('register-referrer-address');
    let isReferralMode = false;
    if (!referrer) {
        // اگر در URL نبود، از userData یا deployer استفاده کن
        const { contract } = window.contractConfig;
        const userData = await contract.users(window.contractConfig.address);
        referrer = userData.referrer || (await contract.deployer());
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


    // نمایش موجودی‌های کاربر
    await window.displayUserBalances();
    
    // نمایش مقدار مورد نیاز
    const cpaRequiredSpan = document.getElementById('register-cpa-required');
    if (cpaRequiredSpan) cpaRequiredSpan.textContent = regPrice; // Static value

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
    // (Find the main registration form logic and add after CPA balance logic)

    // Set required MATIC (for registration, e.g. 0.05 MATIC for gas)
    const requiredMatic = 0.05; // You can adjust this value as needed
    const maticRequiredSpan = document.getElementById('register-matic-required');
    if (maticRequiredSpan) maticRequiredSpan.textContent = requiredMatic + ' MATIC';

    // 3. Update register button logic to check both CPA and MATIC balance
    const registerBtn = document.getElementById('register-btn');
    const registerStatus = document.getElementById('register-status');
    if (registerBtn) {
      // Get user address from input (not just connected wallet)
      const userAddressInput = document.getElementById('register-user-address');
      let targetUserAddress = userAddressInput ? userAddressInput.value.trim() : '';
      const referrerInput = document.getElementById('referrer-address');
      let referrer = referrerInput ? referrerInput.value.trim() : '';

      if (!/^0x[a-fA-F0-9]{40}$/.test(targetUserAddress)) {
        if (registerStatus) registerStatus.textContent = 'آدرس کیف پول کاربر جدید معتبر نیست.';
        registerBtn.disabled = false;
        registerBtn.textContent = 'ثبت‌ نام';
        return;
      }
      if (!/^0x[a-fA-F0-9]{40}$/.test(referrer)) {
        if (registerStatus) registerStatus.textContent = 'آدرس معرف معتبر نیست.';
        registerBtn.disabled = false;
        registerBtn.textContent = 'ثبت‌ نام';
        return;
      }
      // بررسی ثبت‌نام نبودن کاربر جدید
      let userData;
      try {
        userData = await contract.users(targetUserAddress);
      } catch (e) { userData = null; }
      if (userData && userData.activated) {
        if (registerStatus) registerStatus.textContent = 'این آدرس قبلاً ثبت‌نام کرده است.';
        registerBtn.disabled = false;
        registerBtn.textContent = 'ثبت‌ نام';
        return;
      }
      // بررسی فعال بودن رفرر
      let refData;
      try {
        refData = await contract.users(referrer);
      } catch (e) { refData = null; }
      if (!refData || !refData.activated) {
        if (registerStatus) registerStatus.textContent = 'معرف فعال نیست.';
        registerBtn.disabled = false;
        registerBtn.textContent = 'ثبت‌ نام';
        return;
      }
      // بررسی موجودی ولت متصل (address)
      if (parseFloat(userLvlBalance) < parseFloat(requiredTokenAmount)) {
        registerBtn.disabled = true;
        registerBtn.textContent = 'موجودی USDC کافی نیست';
        if (registerStatus) registerStatus.textContent = 'برای ثبت‌نام باید حداقل '+requiredTokenAmount+' USDC داشته باشید. لطفاً ابتدا کیف پول خود را شارژ کنید.';
        return;
      } else if (parseFloat(maticBalance) < requiredMatic) {
        registerBtn.disabled = true;
        registerBtn.textContent = 'موجودی متیک کافی نیست';
        if (registerStatus) registerStatus.textContent = 'برای ثبت‌نام باید حداقل '+requiredMatic+' MATIC در کیف پول خود داشته باشید.';
        return;
      }
      // ثبت‌نام
      registerBtn.disabled = true;
      registerBtn.textContent = 'در حال ثبت‌نام...';
      try {
        await contract.registerAndActivate(referrer, targetUserAddress);
        registerStatus.textContent = 'ثبت‌نام با موفقیت انجام شد!';
        registerBtn.style.display = 'none';
      } catch (e) {
        if (e.code === 4001) {
          registerStatus.textContent = 'فرآیند ثبت‌نام توسط شما لغو شد.';
        } else {
          registerStatus.textContent = 'خطا در ثبت‌نام: ' + (e.message || e);
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
        if (!refData.activated) throw new Error('معرف فعال نیست');
        // بررسی ثبت‌نام نبودن نفر جدید
        const userData = await contract.users(newUserAddress);
        if (userData.activated) throw new Error('این آدرس قبلاً ثبت‌نام کرده است');
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
        const [cpaBalance, usdcBalance, maticBalance] = await Promise.all([
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
        const cpaFormatted = parseFloat(ethers.formatUnits(cpaBalance, 18)).toFixed(4);
        const usdcFormatted = parseFloat(ethers.formatUnits(usdcBalance, 6)).toFixed(2);
        const maticFormatted = parseFloat(ethers.formatEther(maticBalance)).toFixed(4);
        
        // به‌روزرسانی المنت‌های موجودی
        const balanceElements = {
            'user-cpa-balance': `${cpaFormatted} CPA`,
            'user-usdc-balance': `${usdcFormatted} USDC`,
            'user-matic-balance': `${maticFormatted} MATIC`,
            'register-cpa-balance': `${cpaFormatted} CPA`,
            'register-usdc-balance': `${usdcFormatted} USDC`,
            'register-matic-balance': `${maticFormatted} MATIC`
        };
        
        // به‌روزرسانی همه المنت‌های موجود
        Object.entries(balanceElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                console.log(`✅ Updated ${id}: ${value}`);
            }
        });
        
        console.log('✅ User balances displayed successfully');
        return { cpaFormatted, usdcFormatted, maticFormatted };
        
    } catch (error) {
        console.error('❌ Error displaying user balances:', error);
        return null;
    }
}

// Export for global use
window.displayUserBalances = displayUserBalances;

